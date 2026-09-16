<div align="center">

<img src="./logo.png" width="96" height="96" alt="Synapse logo" />

# Synapse

**Focus & Grow**

A calm focus companion. Run deep-work sessions, grow your streak, and study smarter with built-in learning tools.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

</div>

## Features

| | Tool | What it does |
| --- | --- | --- |
| ⏱ | **Focus Timer** | 25-minute deep-work and 5-minute break sessions with a Pomodoro-style cycle. |
| 🌱 | **Growth Visual** | A plant rises, unfurls leaves, and blooms as your session progresses, set against an ambient breathing glow and drifting spores. |
| 🔥 | **Streak Bar** | Last-14-day activity at a glance to keep the momentum going. |
| 🌧 | **Ambient Rain** | An optional rain toggle for a calmer background. |
| 🧠 | **Learning Tools** | Feynman Mode, ELI5, Flashcards, Study Chat, Planner, and Squad — a growing suite of study companions. |

> The learning tools are currently placeholders and marked *Coming soon*.

## Getting Started

**Requirements:** Node.js `>= 20` and [pnpm](https://pnpm.io) (version pinned in `package.json`).

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Starts the dev server with hot reload. |
| `pnpm build` | Creates a production build. |
| `pnpm start` | Serves the production build. |

## Project Structure

```
.
├── app/                  # App Router pages & root layout
│   ├── layout.tsx        # metadata, favicon/logo, fonts, theme
│   ├── page.tsx          # entry point → <SynapseApp />
│   └── globals.css       # dark forest theme + animation keyframes
├── components/
│   ├── ui/               # base UI primitives
│   └── synapse/          # timer, growth visual, streaks, navigation, tools
├── hooks/                # focus-timer & ambient-rain state
├── lib/                  # shared helpers
└── public/               # static assets (favicon, logo)
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Language | TypeScript |
| Package manager | pnpm 12 |
| Hosting | Vercel |

## Deployment

This project deploys on [Vercel](https://vercel.com). Vercel installs dependencies with a frozen `pnpm install`, so keep `pnpm-lock.yaml` in sync after changing dependencies:

```bash
pnpm install --lockfile-only
```

---

<p align="center">
  <sub>Built for calm, focused work. All rights reserved.</sub>
</p>