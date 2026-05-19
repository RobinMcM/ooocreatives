import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getLesson, updateLesson, deleteLesson } from "@/lib/lessons-db";
import { uploadLessonPhoto } from "@/lib/do-spaces";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();
  const title = formData.get("title") as string | null;
  const file = formData.get("photo") as File | null;
  const description = formData.get("description") as string | null;
  const date = formData.get("date") as string | null;
  const time = formData.get("time") as string | null;
  const durationRaw = formData.get("durationMinutes") as string | null;

  const updates: any = {};
  if (title) updates.title = title;
  if (description !== null) updates.description = description;
  const location = formData.get("location") as string | null;
  const locationUrl = formData.get("locationUrl") as string | null;

  if (date !== null) updates.date = date || "";
  if (time !== null) updates.time = time || "";
  if (durationRaw !== null) updates.durationMinutes = durationRaw ? parseInt(durationRaw, 10) : undefined;
  if (location !== null) updates.location = location || "";
  if (locationUrl !== null) updates.locationUrl = locationUrl || "";

  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    updates.photoUrl = await uploadLessonPhoto(Buffer.from(buffer), file.name, file.type);
  }

  const updated = await updateLesson(id, updates);
  if (!updated) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lesson = await getLesson(id);
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  await deleteLesson(id);
  return NextResponse.json({ success: true });
}
