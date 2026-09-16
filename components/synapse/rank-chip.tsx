import type { Rank } from "@/lib/ranks"
import { cn } from "@/lib/utils"

interface RankChipProps {
  rank: Rank
  next: Rank | null
  progress: number
  focusMinutes: number
  compact?: boolean
}

export function RankChip({ rank, next, progress, focusMinutes, compact }: RankChipProps) {
  return (
    <div className={cn("flex flex-col gap-1", compact && "hidden sm:flex")}>
      <span
        className="inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color: rank.color, backgroundColor: `color-mix(in oklab, ${rank.color} 16%, transparent)` }}
      >
        <span className={cn("size-1.5 rounded-full", rank.id === "iron" && "bg-zinc-400", rank.id === "bronze" && "bg-amber-600", rank.id === "silver" && "bg-slate-400", rank.id === "gold" && "bg-yellow-400", rank.id === "platinum" && "bg-teal-400", rank.id === "diamond" && "bg-sky-400")} />
        {rank.name}
        {focusMinutes > 0 && <span className="font-normal opacity-70">· {focusMinutes}m</span>}
      </span>
      {next && (
        <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: next.color }}
          />
        </div>
      )}
    </div>
  )
}