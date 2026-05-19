import { notFound } from "next/navigation";
import { getMember } from "@/lib/show-sections-db";
import { SectionMemberForm } from "@/components/SectionMemberForm";

export default async function EditCrewPage({
  params,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  const { id, memberId } = await params;
  const member = await getMember(id, "crew", memberId);
  if (!member) notFound();
  return <SectionMemberForm showId={id} section="crew" member={member} roleLabel="Crew Role" />;
}
