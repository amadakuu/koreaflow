# KoreaFlow — Cloudflare D1 + Google OAuth

## 1. Create D1

```bash
npx wrangler d1 create koreaflow-db
```

Copy the returned `database_id` into `wrangler.jsonc`.

Apply migrations:

```bash
npx wrangler d1 migrations apply koreaflow-db --remote
```

For local development:

```bash
npx wrangler d1 migrations apply koreaflow-db --local
```

## 2. Cloudflare Pages

Set the project build command to `npm run build` and output directory to `dist`.
Keep the `functions/` directory in the repository so Pages Functions are deployed.

The D1 binding must be named exactly `DB`.

## 3. Secrets / environment variables

Set these in **Cloudflare Dashboard → Workers & Pages → your project → Settings → Variables and Secrets**.
Use Secret for private values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY`
- `SESSION_SECRET`
- `GEMINI_MODEL` (optional; default `gemini-2.5-flash`)
- `APP_URL` (optional; the OAuth callback uses the current request origin)

Do not put these values in frontend code and do not use `VITE_` prefixes.

## 4. Google OAuth

In Google Cloud Console, create an OAuth 2.0 Web Application client.
Add this authorized redirect URI:

`https://YOUR_DOMAIN/api/auth/callback`

For local development also add:

`http://localhost:3000/api/auth/callback`

The callback must match the origin used by the app.

## 5. Login flow

1. `/api/auth/login` creates a CSRF state cookie and redirects to Google.
2. `/api/auth/callback` exchanges the code with Google.
3. The Google profile is inserted/updated in D1 `users`.
4. A signed HttpOnly session cookie is issued.
5. `/api/auth/me` returns the current user.
6. Logout clears the session.

## 6. AI security

The browser calls `/api/generate-vocab`, `/api/quiz`, and `/api/stories`.
Those Pages Functions call Gemini. The Gemini API key never reaches the browser.
