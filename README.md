# bestauto.lv

Marketplace for buying and selling cars in Latvia — private sellers and dealers. Latvian (default) and Russian.

> **Status: prototype moving to production.** Listings and dealers are stored in PostgreSQL (Supabase). Login is still
> demo-only, and user actions (favorites, moderation, settings) are stored in the browser. See [Before production](#before-production).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com) + [MUI 7](https://mui.com) components
- [next-intl](https://next-intl.dev) — Latvian / Russian
- [Leaflet](https://leafletjs.com) + OpenStreetMap — dealer maps, location picker
- [Photon](https://photon.komoot.io) — address suggestions (OpenStreetMap geocoder)
- [Supabase](https://supabase.com) PostgreSQL (EU) + [Drizzle ORM](https://orm.drizzle.team) — database, typed SQL and migrations

## Getting started

```bash
npm install
# create .env.local (see Environment variables), then:
npm run db:migrate   # create tables
npm run db:seed      # load demo dealers and listings
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | After changing `lib/db/schema.ts`: writes a new SQL migration to `lib/db/migrations/` |
| `npm run db:migrate` | Applies pending migrations to the database |
| `npm run db:seed` | Loads demo dealers and listings into an empty database (`-- --reset` wipes and reloads; `-- --reset --generate 100` adds 100 random listings for testing search and pagination) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run catalog:build` | Rebuilds car brands and models from the Dutch vehicle register (RDW open data, CC0) — run yearly |

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for link previews, sitemap and robots | `http://localhost:3000` |
| `DATABASE_URL` | Server only. Supabase **transaction pooler** connection string (port 6543), used by the app | — |
| `MIGRATIONS_DATABASE_URL` | Server only. Supabase **session pooler** (port 5432), used by migrations and seeding | `DATABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project (for Supabase Auth, later) | — |

The connection strings contain the database password: keep them in `.env.local` (git-ignored) and in the
hosting provider's settings, never in code. All tables have Row Level Security enabled with no policies, so
the public Supabase key cannot read or change them; only the Next.js server (which connects as the owner) can.

### Demo accounts

Open **Ienākt** (Login) and use the demo buttons, or log in with password `demo1234`:

| Account | Email | What to try |
|---|---|---|
| Private seller | `andris@demo.lv` | Account page, listing statuses, settings |
| Dealer | `dealer@demo.lv` | Dealer settings (address, map pin, opening hours) |
| Moderator | `admin@demo.lv` | `/admin` — approvals, reports, users, collections |

## Project structure

```
app/[locale]/      Routes (pages, metadata, error pages); locale is "lv" (no prefix) or "ru"
features/          Code grouped by feature: cars, dealers, favorites, compare, account, admin, moderation…
  */api.ts         Server-only data access: the SQL queries for the feature (Drizzle), cached
  */actions.ts     Server Actions: how client components ask the server for data (validate input here)
  */hooks.ts       Client hooks: counters from CatalogProvider, listings loaded on demand via actions
  */data/          Demo data, loaded into the database by npm run db:seed
  */types.ts       Shared types (Listing, Dealer, User)
  */components/    Feature UI
components/        Shared layout (header, footer) and UI pieces
lib/               Helpers: formatting, geo, places (all Latvian towns and novadi), local storage store, colors
lib/db/            Database: schema.ts (tables), migrations/ (generated SQL), index.ts (server-only client)
messages/{lv,ru}/  Translations, one file per feature
i18n/              next-intl routing and message loading
proxy.ts           Locale routing (Next.js middleware)
```

Conventions:

- All user-facing text lives in `messages/` — never hard-code strings in components.
- The brand color is defined once in `lib/colors.ts`.
- **SQL lives in `features/{cars,dealers}/api.ts`** (server-only). Server pages call its async functions
  (`getListing`, `searchListings`…); client components use the hooks in `hooks.ts`, which load only what the page
  needs (`useListingsByIds`, `useDealerLookup`…). The browser never receives the whole catalogue.
- **`/cars` and `/dealers` search runs on the server:** filters in the URL become a SQL `WHERE`, results come
  20 listings / 10 dealers per page (`?page=2`) with real links (`components/ui/Pagination.tsx`), so search
  engines can reach every page. The dealers map gets light pins for all matches; "search as I move the map"
  puts the map area in the URL (`?bounds=south,west,north,east`).
  ESLint blocks importing `@/lib/db` or the demo `data/` files anywhere else.
- **Caching:** query results are cached with the tags `"listings"` / `"dealers"` for up to 5 minutes. Code that
  changes data must call `revalidateTag("listings")` (or `"dealers"`) so pages update at once.
- **No copies of related data:** a listing references its dealer (`dealer_id`) and contact person (`contact_id`);
  the dealer's name and phone are read with a JOIN in `features/cars/api.ts`, so a change in `dealers` shows everywhere.
- **Schema changes:** edit `lib/db/schema.ts` → `npm run db:generate` → review the SQL → `npm run db:migrate`.
  Commit the migration files. When a change must move existing data (like `0001_dealer_ids.sql`), edit the
  generated SQL by hand to fill new columns before old ones are dropped.
- A dealer's own profile (catalogue + saved settings + account) is built in one place: `useOwnDealer()`.
- Profile changes go through `updateProfile()` in `features/auth/store.ts`, never by rewriting the session.
- Browser-stored state goes through `lib/localStore.ts`, so each store can later be swapped for an API call.
- `TODO(backend)` comments mark the places to connect to the backend.

## Security

`next.config.ts` sends security headers on every page (Content-Security-Policy, HSTS, X-Frame-Options,
nosniff, Referrer-Policy, Permissions-Policy). **When adding an external service** (map tiles, photo CDN,
analytics…), add its domain to the `sources` list there, otherwise the browser will block it.

## Before production

- **Backend:** real authentication (Supabase Auth); server-side admin role checks; saving listings and photo
  uploads (Cloudflare R2) from the sell form; server-side search on `/cars`; moving favorites, statuses,
  moderation and settings from the browser to the database.
- **Services:** OpenStreetMap tiles and the public Photon server are for light use — switch to a tile provider
  (e.g. MapTiler, Stadia) and a self-hosted geocoder or the VZD address register.
- **Content:** real contact email and a lawyer-reviewed privacy policy.
- **Monitoring:** connect an error-tracking service (see `app/[locale]/error.tsx`).
