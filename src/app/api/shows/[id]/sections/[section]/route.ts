import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";
import { getShow } from "@/lib/shows-db";
import { getMembers, createMember } from "@/lib/show-sections-db";

const ALLOWED = ["crew", "team"];
const ADMIN_ROLES = ["admin", "Admin"];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; section: string }> }
) {
  const { id, section } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const members = await getMembers(id, section);
  return NextResponse.json(members);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; section: string }> }
) {
  const session = await getSessionForValidation();
  if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [role, show] = await Promise.all([getUserRole(session.userId), getShow(id)]);
  if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
  const isAdmin = ADMIN_ROLES.includes(role ?? "");
  const isSuperUser = role === "Super User";
  const isCreative = role === "Creative";
  const isOwner = show.createdByUserId === session.userId;
  // Legacy shows (no createdByUserId) are manageable by any privileged role
  const canManage = !show.createdByUserId
    ? (isAdmin || isSuperUser || isCreative)
    : (isAdmin || isSuperUser || isOwner);
  if (!canManage) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { roleName } = body;
  if (!roleName) return NextResponse.json({ error: "Role name is required" }, { status: 400 });

  const member = await createMember(id, section, roleName);
  return NextResponse.json(member, { status: 201 });
}
