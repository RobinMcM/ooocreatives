import { NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";

export async function GET() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ roles: [] });
  }

  try {
    const role = await getUserRole(session.userId);
    console.log("[user-roles] userId:", session.userId, "role:", role);
    return NextResponse.json({ roles: role ? [role] : [] });
  } catch (err) {
    console.error("[user-roles] DB error:", err);
    return NextResponse.json({ roles: [] });
  }
}
