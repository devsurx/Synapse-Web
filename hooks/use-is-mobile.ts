"use client"

import { useEffect, useState } from "react"

/**
 * True on phones/tablets: coarse (touch) pointer or a narrow viewport.
 * Used to surface mobile-only UI like the app download promo.
 */
export function useIsMobileDevice(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const coarse = window.matchMedia("(pointer: coarse)")
    const narrow = window.matchMedia("(max-width: 768px)")
    const compute = () => setIsMobile(coarse.matches || narrow.matches)
    compute()
    coarse.addEventListener("change", compute)
    narrow.addEventListener("change", compute)
    return () => {
      coarse.removeEventListener("change", compute)
      narrow.removeEventListener("change", compute)
    }
  }, [])

  return isMobile
}
