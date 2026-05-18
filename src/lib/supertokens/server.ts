import { cookies, headers } from "next/headers";

// For production, you'd want to use SuperTokens' actual backend SDK
// For now, we'll use a simple session validation based on SuperTokens cookies

export interface Session {
  userId?: string;
}

/**
 * Verify and get session from request headers/cookies
 * This is a simplified version - in production you should use the full SuperTokens backend SDK
 */
export async function getSessionForValidation(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const accessToken = cookieStore.get("sAccessToken")?.value;
    const refreshToken = cookieStore.get("sRefreshToken")?.value;
    const authHeader = headerStore.get("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    const allCookies = cookieStore.getAll().map((c) => c.name);
    console.log("[auth] cookies present:", allCookies);
    console.log("[auth] sAccessToken:", accessToken ? `${accessToken.slice(0, 20)}...` : "missing");
    console.log("[auth] sRefreshToken:", refreshToken ? `${refreshToken.slice(0, 20)}...` : "missing");
    console.log("[auth] Authorization header:", authHeader ?? "missing");
    console.log("[auth] bearerToken:", bearerToken ? `${bearerToken.slice(0, 20)}...` : "missing");

    if (!accessToken && !refreshToken && !bearerToken) {
      console.log("[auth] REJECTED — no token found in cookies or Authorization header");
      return null;
    }

    console.log("[auth] ACCEPTED");
    return {};
  } catch (error) {
    console.error("[auth] Error validating session:", error);
    return null;
  }
}
