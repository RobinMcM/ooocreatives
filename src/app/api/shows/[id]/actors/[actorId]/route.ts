import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getActor, updateActor, deleteActor } from "@/lib/actors-db";
import { uploadActorPhoto } from "@/lib/do-spaces";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actorId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: showId, actorId } = await params;
  const actor = await getActor(showId, actorId);
  if (!actor) return NextResponse.json({ error: "Actor not found" }, { status: 404 });

  const formData = await request.formData();
  const name = formData.get("name") as string | null;
  const file = formData.get("photo") as File | null;

  const updates: Partial<{ name: string; photoUrl: string }> = {};
  if (name) updates.name = name;
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    updates.photoUrl = await uploadActorPhoto(showId, Buffer.from(buffer), file.name, file.type);
  }

  const updated = await updateActor(showId, actorId, updates);
  if (!updated) return NextResponse.json({ error: "Failed to update actor" }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; actorId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: showId, actorId } = await params;
  const deleted = await deleteActor(showId, actorId);

  if (!deleted) return NextResponse.json({ error: "Actor not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
