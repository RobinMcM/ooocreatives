import type { CourseTemplate } from "./do-spaces";
import { getCourseTemplatesMetadata, saveCourseTemplatesMetadata } from "./do-spaces";

export type { CourseTemplate };

export async function getCourseTemplates(): Promise<CourseTemplate[]> {
  return getCourseTemplatesMetadata();
}

export async function getCourseTemplate(id: string): Promise<CourseTemplate | null> {
  const templates = await getCourseTemplatesMetadata();
  return templates.find((t) => t.id === id) ?? null;
}

export async function createCourseTemplate(
  title: string,
  photoUrl: string,
  description: string,
  durationMinutes?: number,
  location?: string,
  locationUrl?: string
): Promise<CourseTemplate> {
  const templates = await getCourseTemplatesMetadata();
  const newTemplate: CourseTemplate = {
    id: Date.now().toString(),
    title,
    photoUrl,
    description,
    ...(durationMinutes != null ? { durationMinutes } : {}),
    ...(location ? { location } : {}),
    ...(locationUrl ? { locationUrl } : {}),
    createdAt: new Date().toISOString(),
  };
  await saveCourseTemplatesMetadata([...templates, newTemplate]);
  return newTemplate;
}

export async function updateCourseTemplate(
  id: string,
  updates: Partial<Pick<CourseTemplate, "title" | "photoUrl" | "description" | "durationMinutes" | "location" | "locationUrl">>
): Promise<CourseTemplate | null> {
  const templates = await getCourseTemplatesMetadata();
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  templates[idx] = { ...templates[idx], ...updates };
  await saveCourseTemplatesMetadata(templates);
  return templates[idx];
}

export async function deleteCourseTemplate(id: string): Promise<boolean> {
  const templates = await getCourseTemplatesMetadata();
  const filtered = templates.filter((t) => t.id !== id);
  if (filtered.length === templates.length) return false;
  await saveCourseTemplatesMetadata(filtered);
  return true;
}
