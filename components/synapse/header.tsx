"use client"

import Image from "next/image"
import { CloudRain } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getRank } from "@/lib/ranks"
import { readStats, subscribeStats } from "@/lib/stats"
import { useAmbientRain } from "@/hooks/use-ambient-rain"
import { StormLayer } from "./storm-layer"
import { RankChip } from "./rank-chip"

export function Header() {
  const { enabled, toggle, flash } = useAmbientRain()
  const [focusMinutes, setFocusMinutes] = useState(() => readStats().focusMinutes)

  useEffect(() => {
    const unsub = subscribeStats((s) => {
      setFocusMinutes(s.focusMinutes)
    })
    return unsub
  }, [])

  const { rank, next, progress } = getRank(focusMinutes)

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/logo.png"
          alt="Synapse logo"
          width={44}
          height={44}
          className="size-11 rounded-full object-cover"
          priority
        />
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate font-serif text-3xl leading-none text-foreground">Synapse</span>
          <RankChip
            rank={rank}
            next={next}
            progress={progress}
            focusMinutes={focusMinutes}
            compact
          />
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
          enabled
            ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
            : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
        )}
      >
        <CloudRain className={cn("size-4", enabled && "animate-pulse")} strokeWidth={1.75} />
        {enabled ? "Storm on" : "Storm off"}
      </button>

      <StormLayer enabled={enabled} flash={flash} />
    </header>
  )
}