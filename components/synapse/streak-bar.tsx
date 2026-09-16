import { cn } from "@/lib/utils"

// mocked last-14-day activity: number of focus sessions per day
const DAYS = [2, 3, 1, 4, 0, 2, 5, 3, 4, 2, 6, 3, 4, 2]

function level(count: number) {
  if (count === 0) return "bg-secondary"
  if (count <= 2) return "bg-accent/40"
  if (count <= 4) return "bg-accent/70"
  return "bg-accent"
}

export function StreakBar() {
  const total = DAYS.reduce((a, b) => a + b, 0)
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-border bg-card/60 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">Last 14 days</p>
        <p className="text-xs text-muted-foreground">{total} sessions completed</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {DAYS.map((count, i) => (
          <span
            key={i}
            title={`${count} sessions`}
            className={cn("size-3 rounded-full transition-colors", level(count))}
          />
        ))}
      </div>
    </div>
  )
}
