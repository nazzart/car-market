# bestauto.lv

Marketplace for buying and selling cars in Latvia — private sellers and dealers. Latvian (default) and Russian.

> **Status: front-end prototype.** All pages and flows work, but data is sample data in code and user
> actions (login, favorites, moderation, settings) are stored in the browser. See [Before production](#before-production).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript (strict)
- [Tailwind CSS 4](https://tailwindcss.com) + [MUI 7](https://mui.com) components
- [next-intl](https://next-intl.dev) — Latvian / Russian
- [Leaflet](https://leafletjs.com) + OpenStreetMap — dealer maps, location picker
- [Photon](https://photon.komoot.io) — address suggestions (OpenStreetMap geocoder)

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run catalog:build` | Rebuilds car brands and models from the Dutch vehicle register (RDW open data, CC0) — run yearly |

### Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL for link previews, sitemap and robots | `http://localhost:3000` |

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
  */api.ts         Data access for the feature — the only code that reads */data/
  */data/          Sample data — to be replaced by the database
  */types.ts       Shared types (Listing, Dealer, User)
  */components/    Feature UI
components/        Shared layout (header, footer) and UI pieces
lib/               Helpers: formatting, geo, places (all Latvian towns and novadi), local storage store, colors
messages/{lv,ru}/  Translations, one file per feature
i18n/              next-intl routing and message loading
proxy.ts           Locale routing (Next.js middleware)
```

Conventions:

- All user-facing text lives in `messages/` — never hard-code strings in components.
- The brand color is defined once in `lib/colors.ts`.
- **Data access goes through `features/{cars,dealers,auth}/api.ts`.** Server pages use the async functions
  (`getListing`, `getDealers`…), client components use the hooks (`useListings`, `useDealerLookup`…).
  ESLint blocks importing `data/listings`, `data/dealers` or `data/demoUsers` anywhere else.
- A dealer's own profile (catalogue + saved settings + account) is built in one place: `useOwnDealer()`.
- Profile changes go through `updateProfile()` in `features/auth/store.ts`, never by rewriting the session.
- Browser-stored state goes through `lib/localStore.ts`, so each store can later be swapped for an API call.
- `TODO(backend)` comments mark the places to connect to the backend.

## Security

`next.config.ts` sends security headers on every page (Content-Security-Policy, HSTS, X-Frame-Options,
nosniff, Referrer-Policy, Permissions-Policy). **When adding an external service** (map tiles, photo CDN,
analytics…), add its domain to the `sources` list there, otherwise the browser will block it.

## Before production

- **Backend:** database for listings, users and dealers; real authentication; server-side admin role checks;
  saving listings and photo uploads from the sell form.
- **Services:** OpenStreetMap tiles and the public Photon server are for light use — switch to a tile provider
  (e.g. MapTiler, Stadia) and a self-hosted geocoder or the VZD address register.
- **Content:** real contact email and a lawyer-reviewed privacy policy.
- **Monitoring:** connect an error-tracking service (see `app/[locale]/error.tsx`).
