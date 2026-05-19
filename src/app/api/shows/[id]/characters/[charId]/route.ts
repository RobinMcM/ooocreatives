import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getCharacter, updateCharacter, deleteCharacter } from "@/lib/characters-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: showId, charId } = await params;
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
  const deleted = await deleteCharacter(showId, charId);
  if (!deleted) return NextResponse.json({ error: "Character not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
