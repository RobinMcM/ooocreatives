import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getMembers, createMember } from "@/lib/show-sections-db";

const ALLOWED = ["crew", "team"];

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
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, section } = await params;
  if (!ALLOWED.includes(section)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { roleName } = body;
  if (!roleName) return NextResponse.json({ error: "Role name is required" }, { status: 400 });

  const member = await createMember(id, section, roleName);
  return NextResponse.json(member, { status: 201 });
}
