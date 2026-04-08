const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;
const websiteDomain =
  browserOrigin ?? process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? "http://localhost:3000";

/**
 * RapidMVP-style app info:
 * - auth UI lives at /auth
 * - auth API requests go to the same origin /auth path unless overridden
 */
export const appInfo = {
  appName: "OOO Creatives",
  apiDomain: process.env.NEXT_PUBLIC_AUTH_API_URL ?? websiteDomain,
  websiteDomain,
  apiBasePath: "/auth",
  websiteBasePath: "/auth",
};
