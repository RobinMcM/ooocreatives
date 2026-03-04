/**
 * SuperTokens app info – auth API is hosted at api.movieshaker.com
 */
export const appInfo = {
  appName: "OOO Creatives",
  apiDomain:
    typeof window !== "undefined"
      ? "https://api.movieshaker.com"
      : process.env.NEXT_PUBLIC_AUTH_API_DOMAIN ?? "https://api.movieshaker.com",
  websiteDomain:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBasePath: "/auth",
  websiteBasePath: "/auth",
};
