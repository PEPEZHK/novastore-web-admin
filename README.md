# NovaStore Remix Admin

## Environment Variables

This app requires server-side environment variables. Do not hardcode credentials in source files.

Required variables:

```bash
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=
```

## Netlify Setup

1. Open **Site configuration -> Environment variables**.
2. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET`.
3. Trigger a new deploy.

The app reads these values at runtime on the server via `process.env`.

## Local Development

1. Copy `.env.example` to `.env`.
2. Fill in your local values.
3. Run:

```bash
npm install
npm run dev
```

Notes:
- Never commit real `.env` values.
- `.env` and `.env.*` are ignored by git (except `.env.example`).
