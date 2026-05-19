import { SectionMemberForm } from "@/components/SectionMemberForm";

export default async function NewTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SectionMemberForm showId={id} section="team" roleLabel="Team Role" />;
}
