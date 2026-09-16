export interface Rank {
  id: string
  name: string
  short: string
  minMinutes: number
  color: string
  badgeBg: string
  icon: string
}

export const RANKS: Rank[] = [
  {
    id: "iron",
    name: "Iron",
    short: "Irn",
    minMinutes: 0,
    color: "#9aa0a6",
    badgeBg: "bg-zinc-700/60",
    icon: "Iron",
  },
  {
    id: "bronze",
    name: "Bronze",
    short: "Brz",
    minMinutes: 300,
    color: "#cd7f32",
    badgeBg: "bg-amber-800/60",
    icon: "Bronze",
  },
  {
    id: "silver",
    name: "Silver",
    short: "Slv",
    minMinutes: 900,
    color: "#bfc5cf",
    badgeBg: "bg-slate-500/60",
    icon: "Silver",
  },
  {
    id: "gold",
    name: "Gold",
    short: "Gld",
    minMinutes: 2400,
    color: "#f5c542",
    badgeBg: "bg-yellow-600/60",
    icon: "Gold",
  },
  {
    id: "platinum",
    name: "Platinum",
    short: "Plt",
    minMinutes: 6000,
    color: "#6dd5d0",
    badgeBg: "bg-teal-500/60",
    icon: "Platinum",
  },
  {
    id: "diamond",
    name: "Diamond",
    short: "Dia",
    minMinutes: 15000,
    color: "#7ec8f5",
    badgeBg: "bg-sky-400/60",
    icon: "Diamond",
  },
]

export function getRank(focusMinutes: number): {
  rank: Rank
  next: Rank | null
  progress: number
  minutesIntoRank: number
  minutesForNext: number
} {
  let idx = 0
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (focusMinutes >= RANKS[i].minMinutes) {
      idx = i
      break
    }
  }
  const rank = RANKS[idx]
  const next = RANKS[idx + 1] ?? null
  const minutesIntoRank = focusMinutes - rank.minMinutes
  const minutesForNext = next ? next.minMinutes - rank.minMinutes : 1
  const progress = next ? Math.min(minutesIntoRank / minutesForNext, 1) : 1
  return { rank, next, progress, minutesIntoRank, minutesForNext }
}

export function formatMinutes(m: number): string {
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}
