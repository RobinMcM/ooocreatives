import { notFound } from "next/navigation";
import { getGlobalActor } from "@/lib/global-actors-db";
import { CreativeForm } from "@/components/CreativeForm";

export default async function EditCreativePage({
  params,
}: {
  params: Promise<{ actorId: string }>;
}) {
  const { actorId } = await params;
  const actor = await getGlobalActor(actorId);

  if (!actor) notFound();

  return <CreativeForm actor={actor} />;
}
