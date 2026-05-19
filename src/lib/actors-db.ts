import type { Actor } from "./do-spaces";
import { getActorsMetadata, saveActorsMetadata } from "./do-spaces";
import { getShows } from "./shows-db";

export type { Actor };

export async function getActors(showId: string): Promise<Actor[]> {
  return getActorsMetadata(showId);
}

export async function addActor(
  showId: string,
  name: string,
  photoUrl: string,
  characterName?: string,
  bio?: string
): Promise<Actor> {
  const actors = await getActorsMetadata(showId);
  const newActor: Actor = {
    id: Date.now().toString(),
    name,
    photoUrl,
    ...(characterName ? { characterName } : {}),
    ...(bio ? { bio } : {}),
    createdAt: new Date().toISOString(),
  };
  await saveActorsMetadata(showId, [...actors, newActor]);
  return newActor;
}

export async function getActor(showId: string, actorId: string): Promise<Actor | null> {
  const actors = await getActorsMetadata(showId);
  return actors.find((a) => a.id === actorId) ?? null;
}

export async function updateActor(
  showId: string,
  actorId: string,
  updates: Partial<Pick<Actor, "name" | "photoUrl" | "characterName" | "bio">>
): Promise<Actor | null> {
  const actors = await getActorsMetadata(showId);
  const idx = actors.findIndex((a) => a.id === actorId);
  if (idx === -1) return null;
  actors[idx] = { ...actors[idx], ...updates };
  await saveActorsMetadata(showId, actors);
  return actors[idx];
}

export async function getAllActors(): Promise<Actor[]> {
  const shows = await getShows();
  const arrays = await Promise.all(shows.map((s) => getActors(s.id)));
  return arrays.flat();
}

export async function deleteActor(showId: string, actorId: string): Promise<boolean> {
  const actors = await getActorsMetadata(showId);
  const filtered = actors.filter((a) => a.id !== actorId);
  if (filtered.length === actors.length) return false;
  await saveActorsMetadata(showId, filtered);
  return true;
}
