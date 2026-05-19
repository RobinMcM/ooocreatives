import type { SectionMember } from "./do-spaces";
import { getSectionMetadata, saveSectionMetadata } from "./do-spaces";

export type { SectionMember };

export async function getMembers(showId: string, section: string): Promise<SectionMember[]> {
  return getSectionMetadata(showId, section);
}

export async function getMember(showId: string, section: string, memberId: string): Promise<SectionMember | null> {
  const members = await getSectionMetadata(showId, section);
  return members.find((m) => m.id === memberId) ?? null;
}

export async function createMember(showId: string, section: string, roleName: string): Promise<SectionMember> {
  const members = await getSectionMetadata(showId, section);
  const newMember: SectionMember = {
    id: Date.now().toString(),
    roleName,
    createdAt: new Date().toISOString(),
  };
  await saveSectionMetadata(showId, section, [...members, newMember]);
  return newMember;
}

export async function updateMember(
  showId: string,
  section: string,
  memberId: string,
  updates: Partial<Pick<SectionMember, "roleName" | "actorId">>
): Promise<SectionMember | null> {
  const members = await getSectionMetadata(showId, section);
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx === -1) return null;
  members[idx] = { ...members[idx], ...updates };
  await saveSectionMetadata(showId, section, members);
  return members[idx];
}

export async function deleteMember(showId: string, section: string, memberId: string): Promise<boolean> {
  const members = await getSectionMetadata(showId, section);
  const filtered = members.filter((m) => m.id !== memberId);
  if (filtered.length === members.length) return false;
  await saveSectionMetadata(showId, section, filtered);
  return true;
}
