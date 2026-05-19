import { CharacterForm } from "@/components/CharacterForm";

export default async function NewCharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CharacterForm showId={id} />;
}
