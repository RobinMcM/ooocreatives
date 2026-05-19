import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseInstance, updateCourseInstance, deleteCourseInstance } from "@/lib/course-instances-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await getCourseInstance(id);
  if (!instance) return NextResponse.json({ error: "Course instance not found" }, { status: 404 });

  const body = await request.json();
  const updates: Partial<{ date: string; time: string; durationMinutes: number }> = {};
  if ("date" in body) updates.date = body.date || "";
  if ("time" in body) updates.time = body.time || "";
  if ("durationMinutes" in body) updates.durationMinutes = body.durationMinutes ? Number(body.durationMinutes) : undefined;

  const updated = await updateCourseInstance(id, updates);
  if (!updated) return NextResponse.json({ error: "Failed to update instance" }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteCourseInstance(id);
  if (!deleted) return NextResponse.json({ error: "Course instance not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
