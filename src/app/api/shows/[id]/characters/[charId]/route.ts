import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShow } from "@/lib/shows-db";
import { getCharacter, updateCharacter, deleteCharacter } from "@/lib/characters-db";

const ADMIN_ROLES = ["admin", "Admin"];

async function canManageShow(userId: string, showId: string): Promise<boolean> {
  const [role, show] = await Promise.all([getUserRole(userId), getShow(showId)]);
  if (!show) return false;
  return ADMIN_ROLES.includes(role ?? "") || role === "Super User" || show.createdByUserId === userId;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: showId, charId } = await params;

  if (!await canManageShow(session.userId, showId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const character = await getCharacter(showId, charId);
  if (!character) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  const body = await request.json();
  const updates: Partial<{ characterName: string; actorId: string }> = {};
  if (body.characterName !== undefined) updates.characterName = body.characterName;
  if (body.actorId !== undefined) updates.actorId = body.actorId || undefined;

  const updated = await updateCharacter(showId, charId, updates);
  if (!updated) return NextResponse.json({ error: "Failed to update character" }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: showId, charId } = await params;

  if (!await canManageShow(session.userId, showId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await deleteCharacter(showId, charId);
  if (!deleted) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
