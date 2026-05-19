import type { GlobalActor } from "./do-spaces";
import { getGlobalActorsMetadata, saveGlobalActorsMetadata } from "./do-spaces";

export type { GlobalActor as Actor };

export async function getGlobalActors(): Promise<GlobalActor[]> {
  return getGlobalActorsMetadata();
}

export async function getGlobalActor(actorId: string): Promise<GlobalActor | null> {
  const actors = await getGlobalActorsMetadata();
  return actors.find((a) => a.id === actorId) ?? null;
}

export async function createGlobalActor(
  name: string,
  photoUrl: string,
  bio?: string,
  title?: string,
  bioUrl?: string
): Promise<GlobalActor> {
  const actors = await getGlobalActorsMetadata();
  const newActor: GlobalActor = {
    id: Date.now().toString(),
    name,
    photoUrl,
    ...(title ? { title } : {}),
    ...(bio ? { bio } : {}),
    ...(bioUrl ? { bioUrl } : {}),
    createdAt: new Date().toISOString(),
  };
  await saveGlobalActorsMetadata([...actors, newActor]);
  return newActor;
}

export async function updateGlobalActor(
  actorId: string,
  updates: Partial<Pick<GlobalActor, "name" | "photoUrl" | "bio" | "title" | "bioUrl">>
): Promise<GlobalActor | null> {
  const actors = await getGlobalActorsMetadata();
  const idx = actors.findIndex((a) => a.id === actorId);
  if (idx === -1) return null;
  actors[idx] = { ...actors[idx], ...updates };
  await saveGlobalActorsMetadata(actors);
  return actors[idx];
}

export async function deleteGlobalActor(actorId: string): Promise<boolean> {
  const actors = await getGlobalActorsMetadata();
  const filtered = actors.filter((a) => a.id !== actorId);
  if (filtered.length === actors.length) return false;
  await saveGlobalActorsMetadata(filtered);
  return true;
}
