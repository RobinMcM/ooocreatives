import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseInstances, createCourseInstance, deleteCourseInstance } from "@/lib/course-instances-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const all = await getCourseInstances();
  return NextResponse.json(all.filter((i) => i.courseId === id));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const instance = await createCourseInstance(id, body.date || undefined, body.time || undefined);

  return NextResponse.json(instance, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: courseId } = await params;
  const { instanceId } = await request.json();

  const all = await getCourseInstances();
  const instance = all.find((i) => i.id === instanceId && i.courseId === courseId);
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteCourseInstance(instanceId);
  return NextResponse.json({ success: true });
}
