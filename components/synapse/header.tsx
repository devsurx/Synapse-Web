"use client"

import Image from "next/image"
import { CloudRain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAmbientRain } from "@/hooks/use-ambient-rain"

export function Header() {
  const { enabled, toggle } = useAmbientRain()
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
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl leading-none text-foreground">Synapse</span>
          <span className="hidden text-sm text-accent sm:inline">Synergic Stem · Lv 7</span>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={enabled}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
          enabled
            ? "border-primary/40 bg-primary/15 text-primary"
            : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
        )}
      >
        <CloudRain className="size-4" strokeWidth={1.75} />
        {enabled ? "Rain on" : "Rain off"}
      </button>
    </header>
  )
}
