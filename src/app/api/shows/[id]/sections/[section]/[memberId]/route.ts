import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { updateMember, deleteMember } from "@/lib/show-sections-db";

const ALLOWED = ["crew", "team"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; section: string; memberId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section, memberId } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const updates: { roleName?: string; actorId?: string } = {};
  if (body.roleName !== undefined) updates.roleName = body.roleName;
  if (body.actorId !== undefined) updates.actorId = body.actorId === "" ? undefined : body.actorId;

  const updated = await updateMember(id, section, memberId, updates);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; section: string; memberId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section, memberId } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ok = await deleteMember(id, section, memberId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
