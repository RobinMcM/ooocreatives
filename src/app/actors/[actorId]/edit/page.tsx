import { notFound } from "next/navigation";
import { getGlobalActor } from "@/lib/global-actors-db";
import { ActorForm } from "@/components/ActorForm";

export default async function EditActorPage({
  params,
}: {
  params: Promise<{ actorId: string }>;
}) {
  const { actorId } = await params;
  const actor = await getGlobalActor(actorId);

  if (!actor) notFound();

  return <ActorForm actor={actor} />;
}
