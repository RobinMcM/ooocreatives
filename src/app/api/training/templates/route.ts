import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseTemplates, createCourseTemplate } from "@/lib/course-templates-db";
import { uploadCourseTemplatePhoto } from "@/lib/do-spaces";

export async function GET() {
  try {
    const templates = await getCourseTemplates();
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Failed to fetch course templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const file = formData.get("photo") as File;
    const description = (formData.get("description") as string) ?? "";
    const location = (formData.get("location") as string) || undefined;
    const locationUrl = (formData.get("locationUrl") as string) || undefined;

    if (!title || !file) {
      return NextResponse.json({ error: "Title and photo are required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const photoUrl = await uploadCourseTemplatePhoto(Buffer.from(buffer), file.name, file.type);
    const template = await createCourseTemplate(title, photoUrl, description, location, locationUrl);

    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course template" }, { status: 500 });
  }
}
