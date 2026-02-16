# NovaStore Web Admin (Remix + Netlify)

Web admin CRUD app for NovaStore.

## Tech
- Remix (Vite) + TypeScript
- Tailwind CSS
- Netlify Remix adapter
- Cookie session auth (Remix `createCookieSessionStorage`)
- LocalStorage for catalog persistence

## Routes
- `/login`
- `/signup`
- `/logout` (POST only)
- `/dashboard`
- `/products/new`
- `/products/:id/edit`
- `/settings`

## Feature Summary
- Product CRUD with validation
- Create custom categories while adding/editing products
- Search/filter/sort
- Authentication + authorization guards for protected routes
- Editable profile/settings page (saved in browser localStorage)
- Theme mode switch: light/dark/system
- Language switch: English/Turkish
- JSON import/export with schema checks
- Toast notifications

## Auth Setup
```bash
cp .env.example .env
```

Set these variables in `.env`:
- `SESSION_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Default local demo credentials (if env vars are omitted):
- `admin@novastore.com`
- `admin123`

Signup behavior:
- `/signup` creates a `viewer` account.
- Viewer accounts are stored in a signed HttpOnly cookie for demo purposes (browser-local, no external DB).
- Viewer role is read-only on dashboard and cannot access product create/edit or settings pages.

## Run
```bash
npm install
npm run dev
npm run build
```

## Seed Data
First-run seed files are served from:
- `public/shared/categories.seed.json`
- `public/shared/products.seed.json`

These are aligned with root-level `../shared/*.seed.json`.
