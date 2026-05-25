import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShow } from "@/lib/shows-db";
import { getCharacters, createCharacter } from "@/lib/characters-db";

const ADMIN_ROLES = ["admin", "Admin"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const characters = await getCharacters(id);
  return NextResponse.json(characters);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [role, show] = await Promise.all([getUserRole(session.userId), getShow(id)]);
  if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
  const isAdmin = ADMIN_ROLES.includes(role ?? "");
  const isSuperUser = role === "Super User";
  const isOwner = show.createdByUserId === session.userId;
  if (!isAdmin && !isSuperUser && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { characterName } = body;

  if (!characterName) {
    return NextResponse.json({ error: "Character name is required" }, { status: 400 });
  }

  const character = await createCharacter(id, characterName);
  return NextResponse.json(character, { status: 201 });
}
