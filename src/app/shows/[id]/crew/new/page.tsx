import { SectionMemberForm } from "@/components/SectionMemberForm";

export default async function NewCrewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionMemberForm showId={id} section="crew" roleLabel="Crew Role" />;
}
