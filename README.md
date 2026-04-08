# OOO Creatives

Next.js 16 app for `ooocreatives.com` with RapidMVP-style SuperTokens authentication.

## Development

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:3000`.

## Auth architecture (RapidMVP parity)

- Auth UI route is canonical at `/auth`.
- Frontend calls auth API at `/auth/*` on the same public origin.
- Edge proxy forwards `https://ooocreatives.com/auth/*` to `https://auth.rapidmvp.io/auth/*`.
- Non-auth API traffic stays app-specific.

Reference proxy config: `Caddyfile.ooocreatives`.

## Required environment variables

See `.env.example`:

- `NEXT_PUBLIC_WEBSITE_DOMAIN`: website origin used by SuperTokens `websiteDomain`.
- `NEXT_PUBLIC_AUTH_API_URL`: auth API origin used by SuperTokens `apiDomain`.

For first-party auth via edge proxy in production, both should point to the OOO web origin:

```env
NEXT_PUBLIC_WEBSITE_DOMAIN=https://ooocreatives.com
NEXT_PUBLIC_AUTH_API_URL=https://ooocreatives.com
```

## Edge proxy requirement

Production must include this routing rule:

- `https://ooocreatives.com/auth/*` -> `https://auth.rapidmvp.io/auth/*`

Do not proxy non-auth endpoints to `auth.rapidmvp.io`.

## Partner registration checklist (central auth)

In the central auth partner config (same system used for MovieShaker), ensure OOO has:

- callback URLs allowlisted
- return URLs allowlisted
- logout redirect URLs allowlisted
- CORS/session-refresh origin allowlisted for `https://ooocreatives.com`

## Validation checks

After deployment, run:

```bash
curl -i -X OPTIONS "https://ooocreatives.com/auth/session/refresh" \
  -H "Origin: https://ooocreatives.com" \
  -H "Access-Control-Request-Method: POST"
```

Expected: preflight succeeds (2xx/204 with expected CORS headers).

Then validate browser auth flow:

- `/auth` loads sign-in/sign-up UI
- sign-up/sign-in creates a session
- refresh/session persistence works across page reloads
