import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getGlobalActor, updateGlobalActor, deleteGlobalActor } from "@/lib/global-actors-db";
import { uploadGlobalActorPhoto } from "@/lib/do-spaces";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ actorId: string }> }
) {
  const { actorId } = await params;
  const creative = await getGlobalActor(actorId);
  if (!creative) return NextResponse.json({ error: "Creative not found" }, { status: 404 });
  return NextResponse.json(creative);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ actorId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { actorId } = await params;
  const creative = await getGlobalActor(actorId);
  if (!creative) return NextResponse.json({ error: "Creative not found" }, { status: 404 });

  const formData = await request.formData();
  const name = formData.get("name") as string | null;
  const bio = formData.get("bio") as string | null;
  const title = formData.get("title") as string | null;
  const file = formData.get("photo") as File | null;

  const updates: Partial<{ name: string; bio: string; title: string; photoUrl: string }> = {};
  if (name) updates.name = name;
  if (bio !== null) updates.bio = bio || "";
  if (title !== null) updates.title = title || "";
  if (file && file.size > 0) {
    const buffer = await file.arrayBuffer();
    updates.photoUrl = await uploadGlobalActorPhoto(Buffer.from(buffer), file.name, file.type);
  }

  const updated = await updateGlobalActor(actorId, updates);
  if (!updated) return NextResponse.json({ error: "Failed to update creative" }, { status: 500 });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ actorId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { actorId } = await params;
  const deleted = await deleteGlobalActor(actorId);
  if (!deleted) return NextResponse.json({ error: "Creative not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
