"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function SplashScreen() {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1600)
    const t2 = setTimeout(() => setPhase("done"), 2200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === "done") return null

  return (
    <div
      onClick={() => setPhase("out")}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-background transition-opacity duration-600"
      style={{ opacity: phase === "out" ? 0 : 1, pointerEvents: phase === "out" ? "none" : undefined }}
    >
      <div
        aria-hidden
        className="absolute aspect-square w-[34%] rounded-full bg-accent/15 blur-3xl"
        style={{ animation: "synapse-breathe 4s ease-in-out infinite" }}
      />

      <Image
        src="/logo.png"
        alt=""
        width={80}
        height={80}
        priority
        className="relative z-10 size-20 rounded-full object-cover shadow-2xl animate-in zoom-in-95 fade-in duration-500"
      />

      <p className="relative z-10 mt-6 font-serif text-3xl text-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
        Synapse
      </p>

      <p className="relative z-10 mt-2 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
        Focus &amp; Grow
      </p>
    </div>
  )
}