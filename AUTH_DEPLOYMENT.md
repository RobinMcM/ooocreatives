# OOO Creatives Auth Deployment Checklist

This checklist configures `ooocreatives.com` to use the same SuperTokens pattern as RapidMVP.

## 1) Frontend configuration

- Set canonical auth UI route to `/auth`.
- Keep SuperTokens `apiBasePath` and `websiteBasePath` as `/auth`.
- Use first-party auth API origin in production:
  - `NEXT_PUBLIC_WEBSITE_DOMAIN=https://ooocreatives.com`
  - `NEXT_PUBLIC_AUTH_API_URL=https://ooocreatives.com`

## 2) Edge proxy rule (required)

At the OOO edge (Caddy or equivalent), route auth paths only:

- `https://ooocreatives.com/auth*` -> `https://auth.rapidmvp.io/auth*`

Important:

- Preserve forwarded host/proto headers.
- Do not proxy non-auth routes to `auth.rapidmvp.io`.

## 3) Central auth partner registration

In the central auth partner config (where MovieShaker is registered), add or confirm:

- callback URLs for OOO
- return URLs for OOO
- logout redirect URLs for OOO
- CORS/session-refresh origin allowlist includes `https://ooocreatives.com`

## 4) Go-live verification

### Preflight check

```bash
curl -i -X OPTIONS "https://ooocreatives.com/auth/session/refresh" \
  -H "Origin: https://ooocreatives.com" \
  -H "Access-Control-Request-Method: POST"
```

If this returns `404` from Next.js, the `/auth*` edge proxy rule is not active yet.

### Functional checks

- Open `https://ooocreatives.com/auth` and confirm auth UI renders.
- Sign up/sign in succeeds.
- Session persists on reload.
- Refresh endpoint resolves through OOO origin path `/auth/session/refresh`.
