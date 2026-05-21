import type { CourseInstance } from "./do-spaces";
import { getCourseInstancesMetadata, saveCourseInstancesMetadata } from "./do-spaces";

export type { CourseInstance };

export async function getCourseInstances(): Promise<CourseInstance[]> {
  return getCourseInstancesMetadata();
}

export async function getCourseInstance(id: string): Promise<CourseInstance | null> {
  const instances = await getCourseInstancesMetadata();
  return instances.find((i) => i.id === id) ?? null;
}

export async function createCourseInstance(
  courseId: string,
  date?: string,
  time?: string,
  duration?: string
): Promise<CourseInstance> {
  const instances = await getCourseInstancesMetadata();
  const newInstance: CourseInstance = {
    id: Date.now().toString(),
    courseId,
    ...(date ? { date } : {}),
    ...(time ? { time } : {}),
    ...(duration ? { duration } : {}),
    createdAt: new Date().toISOString(),
  };
  await saveCourseInstancesMetadata([...instances, newInstance]);
  return newInstance;
}

export async function updateCourseInstance(
  id: string,
  updates: Partial<Pick<CourseInstance, "date" | "time" | "duration">>
): Promise<CourseInstance | null> {
  const instances = await getCourseInstancesMetadata();
  const idx = instances.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  instances[idx] = { ...instances[idx], ...updates };
  await saveCourseInstancesMetadata(instances);
  return instances[idx];
}

export async function deleteCourseInstance(id: string): Promise<boolean> {
  const instances = await getCourseInstancesMetadata();
  const filtered = instances.filter((i) => i.id !== id);
  if (filtered.length === instances.length) return false;
  await saveCourseInstancesMetadata(filtered);
  return true;
}
