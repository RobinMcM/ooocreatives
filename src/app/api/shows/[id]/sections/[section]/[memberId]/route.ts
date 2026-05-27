import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShow } from "@/lib/shows-db";
import { updateMember, deleteMember } from "@/lib/show-sections-db";

const ALLOWED = ["crew", "team"];
const ADMIN_ROLES = ["admin", "Admin"];

async function canManageShow(userId: string, showId: string): Promise<boolean> {
  const [role, show] = await Promise.all([getUserRole(userId), getShow(showId)]);
  if (!show) return false;
  const isAdmin = ADMIN_ROLES.includes(role ?? "");
  const isSuperUser = role === "Super User";
  const isCreative = role === "Creative";
  const isOwner = show.createdByUserId === userId;
  // Legacy shows (no createdByUserId) are manageable by any privileged role
  if (!show.createdByUserId) return isAdmin || isSuperUser || isCreative;
  return isAdmin || isSuperUser || isOwner;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; section: string; memberId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section, memberId } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!await canManageShow(session.userId, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section, memberId } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!await canManageShow(session.userId, id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ok = await deleteMember(id, section, memberId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
