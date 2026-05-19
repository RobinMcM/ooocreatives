import { NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole } from "@/lib/movieshaker-db";

export async function GET() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ roles: [] });
  }

  const role = await getUserRole(session.userId);
  return NextResponse.json({ roles: role ? [role] : [] });
}
