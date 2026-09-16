# Synapse — Focus & Grow

A calm focus companion. Run deep-work sessions, grow your streak, and study smarter with built-in learning tools.

Built with [Next.js 16](https://nextjs.org) App Router, React 19, and Tailwind CSS 4. See the connecting thought in `components/synapse/` and the session logic in `hooks/`.

## Features

- **Focus timer** — 25m deep-work / 5m break sessions (Pomodoro-style).
- **Growth visual** — a plant rises, unfurls leaves, and blooms as your session progress grows, with an ambient breathing glow and drifting spores.
- **Streak bar** — last-14-day activity at a glance.
- **Ambient rain** — an optional rain toggle for calm background noise.
- **Learning tools** — Feynman Mode, ELI5, Flashcards, Study Chat, Planner, and Squad (currently placeholders, marked *coming soon*).

## Getting started

Requirements: Node.js and [pnpm](https://pnpm.io) (version is pinned in `package.json` via `packageManager`).

```bash
# install dependencies
pnpm install

# start the dev server at http://localhost:3000
pnpm dev

# create a production build
pnpm build

# run the production build
pnpm start
```

> Prefer npm? Vercel resolves the package manager from the `packageManager` field and the `pnpm-lock.yaml` lockfile. If you switch tools, commit the matching lockfile.

## Project structure

```
app/                  # App Router pages, root layout, global styles
  layout.tsx          # metadata, favicon/logo, fonts, theme
  page.tsx            # entry point -> SynapseApp
components/
  ui/                 # base UI primitives (button, etc.)
  synapse/            # app-specific UI: timer, visual, streaks, nav, tools
hooks/                # focus timer + ambient rain state
lib/                  # shared helpers
public/               # static assets (favicon, logo)
```

## Configuration notes

- `next.config.mjs` runs `images.unoptimized` and `typescript.ignoreBuildErrors`.
- The dark "forest-charcoal" theme (with warm amber and sage green) is defined in `app/globals.css`.
- Animations (`synapse-*`) are declared as keyframes in `app/globals.css`.

## Deploying

The project is set up for [Vercel](https://vercel.com). Deploys use a frozen `pnpm install`, so keep `pnpm-lock.yaml` in sync with `package.json` after changing dependencies:

```bash
pnpm install --lockfile-only
```

## License

Private project — all rights reserved.