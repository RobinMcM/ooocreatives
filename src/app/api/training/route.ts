import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCourseInstances, createCourseInstance } from "@/lib/course-instances-db";
import { getCourseTemplates } from "@/lib/course-templates-db";

export async function GET() {
  try {
    const [instances, templates] = await Promise.all([getCourseInstances(), getCourseTemplates()]);
    const templateMap = new Map(templates.map((t) => [t.id, t]));
    const merged = instances
      .map((instance) => {
        const template = templateMap.get(instance.courseId);
        if (!template) return null;
        return { ...instance, ...template, id: instance.id, courseId: instance.courseId };
      })
      .filter(Boolean);
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { courseId, date, time, duration } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const instance = await createCourseInstance(
      courseId,
      date || undefined,
      time || undefined,
      duration ? String(duration) : undefined
    );

    return NextResponse.json(instance, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create course instance" }, { status: 500 });
  }
}
