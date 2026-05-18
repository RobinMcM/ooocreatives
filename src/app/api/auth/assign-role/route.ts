import { NextResponse } from "next/server";
import { getSessionForValidation } from "@/lib/supertokens/server";

export async function POST() {
  const session = await getSessionForValidation();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch("https://auth.rapidmvp.io/core/recipe/user/role", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "cdi-version": "5.0",
    },
    body: JSON.stringify({ tenantId: "public", userId: session.userId, role: "User" }),
  });

  if (!res.ok) {
    console.error("[assign-role] SuperTokens API error:", res.status, await res.text());
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
