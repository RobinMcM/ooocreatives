import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseTemplates, createCourseTemplate } from "@/lib/course-templates-db";
import { uploadCourseTemplatePhoto } from "@/lib/do-spaces";

export async function GET() {
  try {
    const courses = await getCourseTemplates();
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
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
    const duration = (formData.get("duration") as string)?.trim() || undefined;
    const location = (formData.get("location") as string) || undefined;
    const locationUrl = (formData.get("locationUrl") as string) || undefined;

    if (!title || !file) {
      return NextResponse.json({ error: "Title and photo are required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const photoUrl = await uploadCourseTemplatePhoto(Buffer.from(buffer), file.name, file.type);
    const course = await createCourseTemplate(title, photoUrl, description, duration, location, locationUrl);

    return NextResponse.json(course, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
