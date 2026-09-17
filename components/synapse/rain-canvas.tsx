"use client"

import { useEffect, useRef } from "react"

interface Drop {
  x: number
  y: number
  /** fall speed in css px per second */
  speed: number
  /** streak length in css px */
  len: number
  alpha: number
  width: number
}

/** Horizontal lean of a falling drop (px of x drift per px of fall). */
const SLANT = 0.12
const MARGIN = 80

function makeDrops(count: number, w: number, h: number): Drop[] {
  const drops: Drop[] = []
  for (let i = 0; i < count; i++) {
    // depth 0 (far) → 1 (near): near drops fall faster, stretch longer,
    // and draw brighter — the parallax that sells realism.
    const depth = Math.pow(Math.random(), 1.4)
    drops.push({
      x: Math.random() * (w + MARGIN * 2) - MARGIN,
      y: Math.random() * (h + MARGIN * 2) - MARGIN,
      speed: 550 + depth * 950,
      len: 10 + depth * 30,
      alpha: 0.1 + depth * 0.32,
      width: depth > 0.6 ? 1.5 : 1,
    })
  }
  return drops
}

/**
 * Realistic rainfall: discrete streaks with depth parallax and a slight
 * wind slant, instead of full-screen gradient stripes. requestAnimationFrame
 * stops on its own in background tabs; dt is clamped so returning to the
 * tab never teleports drops.
 */
export function RainCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let cssW = 0
    let cssH = 0
    let drops: Drop[] = []
    let raf = 0
    let last = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      const dpr = Math.min(1.5, window.devicePixelRatio || 1)
      cssW = rect.width
      cssH = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(60, Math.min(190, Math.round((cssW * cssH) / 12000)))
      drops = makeDrops(count, cssW, cssH)
    }

    const paint = (advance: number) => {
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.lineCap = "round"
      for (const d of drops) {
        if (advance > 0) {
          d.y += d.speed * advance
          d.x -= SLANT * d.speed * advance
          if (d.y - d.len > cssH + MARGIN) {
            d.y = -MARGIN - Math.random() * 60
            d.x = Math.random() * (cssW + MARGIN * 2) - MARGIN
          } else if (d.x < -MARGIN) {
            d.x += cssW + MARGIN * 2
          }
        }
        const tailX = d.x + SLANT * d.len
        const tailY = d.y - d.len
        const grad = ctx.createLinearGradient(tailX, tailY, d.x, d.y)
        grad.addColorStop(0, "rgba(174, 194, 224, 0)")
        grad.addColorStop(1, `rgba(174, 194, 224, ${d.alpha.toFixed(3)})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = d.width
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }
    }

    resize()
    window.addEventListener("resize", resize)

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Static drizzle frame — no animation loop.
      paint(0)
    } else {
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        paint(dt)
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={className} />
}
