import { cookies, headers } from "next/headers";

export interface Session {
  userId?: string;
}

function parseFrontToken(raw: string): { uid?: string; ate?: number } {
  try {
    // sFrontToken may be URL-encoded and uses base64url encoding
    const decoded = decodeURIComponent(raw).replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(decoded, "base64").toString("utf-8"));
  } catch {
    return {};
  }
}

export async function getSessionForValidation(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const accessToken = cookieStore.get("sAccessToken")?.value;
    const refreshToken = cookieStore.get("sRefreshToken")?.value;
    const authHeader = headerStore.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const frontTokenRaw = cookieStore.get("sFrontToken")?.value;

    // sFrontToken is SuperTokens' cross-domain session indicator — present and non-expired = valid session
    const frontTokenData = frontTokenRaw ? parseFrontToken(frontTokenRaw) : {};
    const frontTokenValid = !!(frontTokenData.ate && frontTokenData.ate > Date.now());

    const allCookies = cookieStore.getAll().map((c) => c.name);
    console.log("[auth] cookies present:", allCookies);
    console.log("[auth] sAccessToken:", accessToken ? "present" : "missing");
    console.log("[auth] sRefreshToken:", refreshToken ? "present" : "missing");
    console.log("[auth] Authorization header:", authHeader ?? "missing");
    console.log("[auth] sFrontToken raw:", frontTokenRaw ? `${frontTokenRaw.slice(0, 40)}...` : "missing");
    console.log("[auth] sFrontToken parsed:", JSON.stringify(frontTokenData));
    console.log("[auth] sFrontToken valid (ate > now):", frontTokenValid);

    if (!accessToken && !refreshToken && !bearerToken && !frontTokenValid) {
      console.log("[auth] REJECTED — no valid token found");
      return null;
    }

    console.log("[auth] ACCEPTED via:", accessToken ? "sAccessToken" : refreshToken ? "sRefreshToken" : bearerToken ? "Bearer header" : "sFrontToken");
    return { userId: frontTokenData.uid };
  } catch (error) {
    console.error("[auth] Error validating session:", error);
    return null;
  }
}
