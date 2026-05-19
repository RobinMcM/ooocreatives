import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getActors, addActor } from "@/lib/actors-db";
import { uploadActorPhoto } from "@/lib/do-spaces";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const actors = await getActors(id);
  return NextResponse.json(actors);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const file = formData.get("photo") as File;
  const characterName = (formData.get("characterName") as string) || undefined;
  const bio = (formData.get("bio") as string) || undefined;

  if (!name || !file) {
    return NextResponse.json({ error: "Name and photo are required" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const photoUrl = await uploadActorPhoto(id, Buffer.from(buffer), file.name, file.type);
  const actor = await addActor(id, name, photoUrl, characterName, bio);

  return NextResponse.json(actor, { status: 201 });
}
