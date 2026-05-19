import { notFound } from "next/navigation";
import { getActor } from "@/lib/actors-db";
import { ActorForm } from "@/components/ActorForm";

export default async function EditActorPage({
  params,
}: {
  params: Promise<{ id: string; actorId: string }>;
}) {
  const { id: showId, actorId } = await params;
  const actor = await getActor(showId, actorId);

  if (!actor) notFound();

  return <ActorForm showId={showId} actor={actor} />;
}
