import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getLessons, createLesson } from "@/lib/lessons-db";
import { uploadLessonPhoto } from "@/lib/do-spaces";

export async function GET() {
  const lessons = await getLessons();
  return NextResponse.json(lessons);
}

export async function POST(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const file = formData.get("photo") as File;
  const description = (formData.get("description") as string) ?? "";
  const date = (formData.get("date") as string) || undefined;
  const time = (formData.get("time") as string) || undefined;
  const durationRaw = formData.get("durationMinutes") as string | null;
  const durationMinutes = durationRaw ? parseInt(durationRaw, 10) : undefined;
  const location = (formData.get("location") as string) || undefined;
  const locationUrl = (formData.get("locationUrl") as string) || undefined;

  if (!title || !file) {
    return NextResponse.json({ error: "Title and photo are required" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const photoUrl = await uploadLessonPhoto(Buffer.from(buffer), file.name, file.type);
  const lesson = await createLesson(title, photoUrl, description, date, time, durationMinutes, location, locationUrl);

  return NextResponse.json(lesson, { status: 201 });
}
