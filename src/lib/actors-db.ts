import type { Actor } from "./do-spaces";
import { getActorsMetadata, saveActorsMetadata } from "./do-spaces";

export type { Actor };

export async function getActors(showId: string): Promise<Actor[]> {
  return getActorsMetadata(showId);
}

export async function addActor(showId: string, name: string, photoUrl: string): Promise<Actor> {
  const actors = await getActorsMetadata(showId);
  const newActor: Actor = {
    id: Date.now().toString(),
    name,
    photoUrl,
    createdAt: new Date().toISOString(),
  };
  await saveActorsMetadata(showId, [...actors, newActor]);
  return newActor;
}

export async function deleteActor(showId: string, actorId: string): Promise<boolean> {
  const actors = await getActorsMetadata(showId);
  const filtered = actors.filter((a) => a.id !== actorId);
  if (filtered.length === actors.length) return false;
  await saveActorsMetadata(showId, filtered);
  return true;
}
