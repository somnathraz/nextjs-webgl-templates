# Premium Frontend

One Next.js app. One domain. Each showcase is a route.

| Route | Showcase |
|-------|----------|
| `/` | Gallery |
| `/aura` | Aura Studio |
| `/offday` | Offday Energy |
| `/forme` | FORME Architecture |
| `/relay` | Relay Agent Orchestration |

## Run

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```sh
npm run typecheck
npm run lint
npm run build
```

## Add a new showcase

1. Create `src/features/<slug>/` with components, hooks, lib, and scoped `styles/theme.css`
2. Add `src/app/<slug>/layout.tsx` (import theme, wrap `.theme-<slug>`) and `page.tsx`
3. Put static assets in `public/<slug>/`
4. Add a card on `src/app/page.tsx`
5. Push — one deploy ships the new route

Scope CSS with:

```sh
node scripts/scope-css.mjs path/to/globals.css src/features/<slug>/styles/theme.css .theme-<slug>
```

## Legacy folders

`aura-studio/` and `offday-energy/` are the original standalone apps (archived sources). The live app is the root Next.js project.

## Deploy

Connect this repo to Vercel (or similar). Root directory = repo root. Framework = Next.js. One production URL serves `/`, `/aura`, `/offday`.
