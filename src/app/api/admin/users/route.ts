import { NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole, getUsersByInitiated } from "@/lib/movieshaker-db";

const ADMIN_ROLES = ["admin", "Admin"];

export async function GET() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getUserRole(session.userId);
  if (!role || !ADMIN_ROLES.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await getUsersByInitiated("oooCreatives");
  return NextResponse.json({ users });
}
