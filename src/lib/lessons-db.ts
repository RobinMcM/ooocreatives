import type { Lesson } from "./do-spaces";
import { getLessonsMetadata, saveLessonsMetadata } from "./do-spaces";

export type { Lesson };

export async function getLessons(): Promise<Lesson[]> {
  return getLessonsMetadata();
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const lessons = await getLessonsMetadata();
  return lessons.find((l) => l.id === id) ?? null;
}

export async function createLesson(
  title: string,
  photoUrl: string,
  description: string,
  date?: string,
  time?: string,
  durationMinutes?: number,
  location?: string,
  locationUrl?: string
): Promise<Lesson> {
  const lessons = await getLessonsMetadata();
  const newLesson: Lesson = {
    id: Date.now().toString(),
    title,
    photoUrl,
    description,
    ...(date ? { date } : {}),
    ...(time ? { time } : {}),
    ...(durationMinutes != null ? { durationMinutes } : {}),
    ...(location ? { location } : {}),
    ...(locationUrl ? { locationUrl } : {}),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await saveLessonsMetadata([...lessons, newLesson]);
  return newLesson;
}

export async function updateLesson(
  id: string,
  updates: Partial<Pick<Lesson, "title" | "photoUrl" | "description" | "date" | "time" | "durationMinutes" | "location" | "locationUrl">>
): Promise<Lesson | null> {
  const lessons = await getLessonsMetadata();
  const idx = lessons.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  lessons[idx] = { ...lessons[idx], ...updates, updatedAt: new Date().toISOString() };
  await saveLessonsMetadata(lessons);
  return lessons[idx];
}

export async function deleteLesson(id: string): Promise<boolean> {
  const lessons = await getLessonsMetadata();
  const filtered = lessons.filter((l) => l.id !== id);
  if (filtered.length === lessons.length) return false;
  await saveLessonsMetadata(filtered);
  return true;
}
