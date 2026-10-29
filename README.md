# bestauto.lv

Marketplace for buying and selling cars in Latvia — private sellers and dealers. Latvian (default) and Russian.

> **Status: moving to production.** Listings, dealers, accounts (Supabase Auth), favorites, listing statuses and
> moderation are stored in PostgreSQL (Supabase). Creating listings from the sell form is not connected yet.
> See [Before production](#before-production).

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
| `npm run db:seed` | Loads demo dealers and listings into an empty database (`-- --reset` replaces demo data — never touches registered accounts and their listings; `-- --reset --generate 100` adds 100 random listings for testing search and pagination) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm run admin:grant -- email` | Give a registered account moderator rights (`--revoke` to remove) |
| `npm run catalog:build` | Rebuilds car brands and models from the Dutch vehicle register (RDW open data, CC0) — run yearly |

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for link previews, sitemap and robots | `http://localhost:3000` |
| `DATABASE_URL` | Server only. Supabase **transaction pooler** connection string (port 6543), used by the app | — |
| `MIGRATIONS_DATABASE_URL` | Server only. Supabase **session pooler** (port 5432), used by migrations and seeding | `DATABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase project: login (Supabase Auth) | — |

The connection strings contain the database password: keep them in `.env.local` (git-ignored) and in the
hosting provider's settings, never in code. All tables have Row Level Security enabled with no policies, so
the public Supabase key cannot read or change them; only the Next.js server (which connects as the owner) can.

### Accounts

Accounts use **Supabase Auth** (email + password). The session lives in a cookie, so the server knows who is asking:
every Server Action that changes data calls `requireUser()` / `requireAdmin()` from `features/auth/api.ts` first.

- **Register** on the site (Ienākt → Izveidot kontu). No city is asked: a private seller picks it in settings or in
  the first listing (then it's saved to the profile). A company account gets a dealer page that buyers see once the
  address and phone are filled in (`features/dealers/lib/listed.ts`), without the "Verified" badge until a moderator
  checks its registration number.
- **Make yourself a moderator** (access to `/admin`): `npm run admin:grant -- you@example.com`
- **Supabase settings** (dashboard):
  - *Authentication → Sign In / Providers → Email → Confirm email*: off for now. Turn it on together with your own
    email sender (e.g. Resend) — Supabase's built-in sender allows only a few emails per hour.
  - *Authentication → URL Configuration*: Site URL `http://localhost:3000` (production URL later) and redirect URL
    `http://localhost:3000/api/auth/callback` — password-reset links land there.

Compare is the only thing kept in the browser (`lib/localStore.ts`): it's a temporary scratch list.

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
lib/               Helpers: formatting (utils.ts), input checks (validate.ts), URL query (url.ts), geo, places
                   (all Latvian towns and novadi), local storage store, colors
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
- **Caching:** query results are cached with the tags `"listings"` / `"dealers"` for up to 5 minutes. A Server
  Action that changes data calls `updateTag("listings")` (or `"dealers"`) so pages update at once.
- **Changing data:** `features/*/actions.ts` (Server Actions: check who is logged in, validate input) →
  `features/*/api.ts` (SQL). Never trust ids or roles sent from the browser. Input checks shared by forms and
  actions (`cleanText`, `isEmail`, `parseListingId`, `isRegNumber`…) are in `lib/validate.ts`.
- **Shared helpers:** prices via `formatPrice()` (`lib/utils.ts`), query-string changes via `withQuery()`
  (`lib/url.ts`), the card spec line "year · km · fuel · gearbox" via `useSpecLine()` (`features/cars/lib`).
- **No copies of related data:** a listing references its dealer (`dealer_id`) and contact person (`contact_id`);
  the dealer's name and phone are read with a JOIN in `features/cars/api.ts`, so a change in `dealers` shows everywhere.
- **Cache version:** after a schema change (or a change to what a cached query returns), bump `CACHE_VERSION` in
  `lib/db/cacheVersion.ts` — cached results survive restarts and deploys and would otherwise have the old shape.
- **Schema changes:** edit `lib/db/schema.ts` → `npm run db:generate` → review the SQL → `npm run db:migrate`.
  Commit the migration files. When a change must move existing data (like `0001_dealer_ids.sql`), edit the
  generated SQL by hand to fill new columns before old ones are dropped.
- The logged-in user in the browser: `useAuth()` (`features/auth/store.ts`); a dealer's own page: `useOwnDealer()`.
- Profile and dealer-page changes go through `saveProfile()` / `saveDealerProfile()` in `features/account/actions.ts`.
- `TODO(...)` comments mark known next steps (search, admin paging, sell form saving).

## Security

`next.config.ts` sends security headers on every page (Content-Security-Policy, HSTS, X-Frame-Options,
nosniff, Referrer-Policy, Permissions-Policy). **When adding an external service** (map tiles, photo CDN,
analytics…), add its domain to the `sources` list there, otherwise the browser will block it.

## Before production

- **Backend:** saving listings and photo uploads (Cloudflare R2) from the sell form; rate limiting for login,
  registration and reports.
- **Email:** own sender (Resend) and *Confirm email* on in Supabase.
- **Services:** OpenStreetMap tiles and the public Photon server are for light use — switch to a tile provider
  (e.g. MapTiler, Stadia) and a self-hosted geocoder or the VZD address register.
- **Content:** real contact email and a lawyer-reviewed privacy policy.
- **Monitoring:** connect an error-tracking service (see `app/[locale]/error.tsx`).
