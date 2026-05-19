import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseTemplate, updateCourseTemplate, deleteCourseTemplate } from "@/lib/course-templates-db";
import { uploadCourseTemplatePhoto } from "@/lib/do-spaces";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const course = await getCourseTemplate(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const course = await getCourseTemplate(id);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const formData = await request.formData();
  const title = formData.get("title") as string | null;
  const file = formData.get("photo") as File | null;
  const description = formData.get("description") as string | null;
  const durationRaw = formData.get("durationMinutes") as string | null;
  const location = formData.get("location") as string | null;
  const locationUrl = formData.get("locationUrl") as string | null;

  const updates: Parameters<typeof updateCourseTemplate>[1] = {};
  if (title) updates.title = title;
  if (description !== null) updates.description = description;
  if (durationRaw !== null) updates.durationMinutes = durationRaw ? parseInt(durationRaw, 10) : undefined;
  if (location !== null) updates.location = location || undefined;
  if (locationUrl !== null) updates.locationUrl = locationUrl || undefined;
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    updates.photoUrl = await uploadCourseTemplatePhoto(Buffer.from(buffer), file.name, file.type);
  }

  const updated = await updateCourseTemplate(id, updates);
  if (!updated) return NextResponse.json({ error: "Failed to update course" }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteCourseTemplate(id);
  if (!deleted) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
