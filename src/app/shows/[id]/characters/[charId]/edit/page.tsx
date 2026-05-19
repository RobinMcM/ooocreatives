import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters-db";
import { CharacterForm } from "@/components/CharacterForm";

export default async function EditCharacterPage({
  params,
}: {
  params: Promise<{ id: string; charId: string }>;
}) {
  const { id: showId, charId } = await params;
  const character = await getCharacter(showId, charId);

  if (!character) notFound();

  return <CharacterForm showId={showId} character={character} />;
}
