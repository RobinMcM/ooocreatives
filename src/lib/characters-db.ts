import type { Character } from "./do-spaces";
import { getCharactersMetadata, saveCharactersMetadata } from "./do-spaces";

export type { Character };

export async function getCharacters(showId: string): Promise<Character[]> {
  return getCharactersMetadata(showId);
}

export async function getCharacter(showId: string, charId: string): Promise<Character | null> {
  const characters = await getCharactersMetadata(showId);
  return characters.find((c) => c.id === charId) ?? null;
}

export async function createCharacter(showId: string, characterName: string): Promise<Character> {
  const characters = await getCharactersMetadata(showId);
  const newCharacter: Character = {
    id: Date.now().toString(),
    characterName,
    createdAt: new Date().toISOString(),
  };
  await saveCharactersMetadata(showId, [...characters, newCharacter]);
  return newCharacter;
}

export async function updateCharacter(
  showId: string,
  charId: string,
  updates: Partial<Pick<Character, "characterName" | "actorId">>
): Promise<Character | null> {
  const characters = await getCharactersMetadata(showId);
  const idx = characters.findIndex((c) => c.id === charId);
  if (idx === -1) return null;
  characters[idx] = { ...characters[idx], ...updates };
  await saveCharactersMetadata(showId, characters);
  return characters[idx];
}

export async function deleteCharacter(showId: string, charId: string): Promise<boolean> {
  const characters = await getCharactersMetadata(showId);
  const filtered = characters.filter((c) => c.id !== charId);
  if (filtered.length === characters.length) return false;
  await saveCharactersMetadata(showId, filtered);
  return true;
}
