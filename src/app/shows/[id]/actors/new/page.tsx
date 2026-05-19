import { ActorForm } from "@/components/ActorForm";

export default async function NewActorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ActorForm showId={id} />;
}
