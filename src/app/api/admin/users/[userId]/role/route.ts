import { NextRequest, NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";
import { getUserRole, upsertUserRole } from "@/lib/movieshaker-db";

const ADMIN_ROLES = ["admin", "Admin"];
const ASSIGNABLE_ROLES = ["User", "Super User"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callerRole = await getUserRole(session.userId);
  if (!callerRole || !ADMIN_ROLES.includes(callerRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json();
  const { role } = body;

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const res = await fetch("https://auth.rapidmvp.io/core/recipe/user/role", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "cdi-version": "5.0",
    },
    body: JSON.stringify({ tenantId: "public", userId, role }),
  });

  if (!res.ok) {
    console.error("[admin/role] SuperTokens API error:", res.status, await res.text());
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }

  await upsertUserRole(userId, role);
  return NextResponse.json({ ok: true, role });
}
