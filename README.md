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
- Header nav shows a `Sign In` button when signed out, and a user icon with logout menu when signed in.

Reference proxy config: `Caddyfile.ooocreatives`.

## Required environment variables

See `.env.example`:

- `NEXT_PUBLIC_WEBSITE_DOMAIN`: website origin used by SuperTokens `websiteDomain`.
- `NEXT_PUBLIC_AUTH_API_URL`: auth API origin used by SuperTokens `apiDomain`.
- `NEXT_PUBLIC_API_URL`: shared data API origin (profiles, roles, admin APIs).

For first-party auth via edge proxy in production, both should point to the OOO web origin:

```env
NEXT_PUBLIC_WEBSITE_DOMAIN=https://ooocreatives.com
NEXT_PUBLIC_AUTH_API_URL=https://ooocreatives.com
NEXT_PUBLIC_API_URL=https://api.rapidmvp.io
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

## Content management pattern

All content sections in this site follow the same pattern — no database is used. Text and image data for every section (carousel, shows, actor profiles, etc.) is stored in DigitalOcean Spaces:

- **Images** are uploaded directly to the `carousel/`, `shows/`, `actors/` prefixes in the `rapidmvp-general-storage` bucket with `public-read` ACL.
- **Metadata** (titles, descriptions, order, linked image URLs, etc.) is stored as a JSON file alongside the images, e.g. `carousel/metadata.json`, `shows/metadata.json`, `actors/metadata.json`.
- The Next.js API routes read/write these JSON files on every request via `getCarouselMetadata()` / `saveCarouselMetadata()` pattern in `src/lib/do-spaces.ts`.
- Admin pages at `/admin/<section>` are protected by SuperTokens session and provide a CRUD UI for each content section.

### Adding a new content section

1. Add upload/download helpers to `src/lib/do-spaces.ts` following the `getCarouselMetadata` / `saveCarouselMetadata` pattern, using a new key prefix (e.g. `shows/metadata.json`).
2. Create a `src/lib/<section>-db.ts` that wraps those helpers with typed CRUD functions.
3. Add API routes at `src/app/api/<section>/route.ts` and `src/app/api/<section>/[id]/route.ts` — call `getSessionForValidation()` on all mutations.
4. Create an admin page at `src/app/admin/<section>/page.tsx` — use `Session.getAccessToken()` and pass `Authorization: Bearer <token>` on all mutating fetch calls.
5. Add a card link to the new section on `src/app/admin/page.tsx`.
6. Add the public display component to the relevant page.

### DO Spaces image domains

`next.config.ts` allows `*.digitaloceanspaces.com` as a remote image pattern so all uploaded content renders via `next/image`.

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
