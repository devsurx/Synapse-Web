"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const STORM_KEY = "synapse:storm"

function loadEnabled(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORM_KEY) === "1"
  } catch {
    return false
  }
}

function makeNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  return buffer
}

function startRain(ctx: AudioContext) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = 900

  const gain = ctx.createGain()
  gain.gain.value = 0
  // the single rain body swells in gradually — several seconds to rise, no whoosh
  gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 5)

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  source.start()

  return {
    source,
    gain,
  }
}

export function useAmbientRain() {
  const [enabled, setEnabled] = useState(false)
  const [flash, setFlash] = useState(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const rainRef = useRef<ReturnType<typeof startRain> | null>(null)
  const thunderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningRef = useRef(false)

  const clearThunder = useCallback(() => {
    if (thunderTimeoutRef.current) {
      clearTimeout(thunderTimeoutRef.current)
      thunderTimeoutRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    runningRef.current = false
    clearThunder()
    const rain = rainRef.current as unknown as {
      source?: AudioBufferSourceNode
      gain?: GainNode
      hissSource?: AudioBufferSourceNode
      hissGain?: GainNode
    } | null
    const ctx = ctxRef.current
    if (rain && ctx) {
      const now = ctx.currentTime
      for (const g of [rain.gain, rain.hissGain]) {
        if (!g) continue
        try {
          g.gain.cancelScheduledValues(now)
          g.gain.setValueAtTime(g.gain.value, now)
          g.gain.linearRampToValueAtTime(0, now + 0.5)
        } catch {
          /* already torn down */
        }
      }
      for (const s of [rain.source, rain.hissSource]) {
        if (!s) continue
        try {
          s.stop(now + 0.6)
        } catch {
          /* already stopped */
        }
      }
    }
    rainRef.current = null
  }, [clearThunder])

  const playThunder = useCallback((ctx: AudioContext) => {
    if (!runningRef.current) return
    const noise = makeNoiseBuffer(ctx, 2.5)
    const source = ctx.createBufferSource()
    source.buffer = noise
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.setValueAtTime(400, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 2.2)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.12)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.2)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    source.stop(ctx.currentTime + 3.4)

    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(65, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 2.4)
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.32, ctx.currentTime)
    oscGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.4)
    osc.connect(oscGain)
    oscGain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 2.6)
  }, [])

  const scheduleThunder = useCallback(
    (ctx: AudioContext) => {
      clearThunder()
      thunderTimeoutRef.current = setTimeout(() => {
        if (!runningRef.current) return
        // Skip the visual strike while the tab is hidden — audio still rumbles,
        // but no state churn / re-renders happen in the background.
        if (typeof document !== "undefined" && document.hidden) {
          scheduleThunder(ctx)
          return
        }
        playThunder(ctx)
        setFlash((f) => f + 1)
        scheduleThunder(ctx)
      }, 9000 + Math.random() * 16000)
    },
    [clearThunder, playThunder],
  )

  const start = useCallback(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx
    if (ctx.state === "suspended") void ctx.resume()
    stop()
    runningRef.current = true
    rainRef.current = startRain(ctx)
    scheduleThunder(ctx)
  }, [scheduleThunder, stop])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (next) start()
      else stop()
      return next
    })
  }, [start, stop])

  useEffect(() => {
    const root = document.documentElement
    if (enabled) {
      root.classList.add("storm")
    } else {
      root.classList.remove("storm")
    }
    try {
      window.localStorage.setItem(STORM_KEY, enabled ? "1" : "0")
    } catch {}
  }, [enabled])

  // Apply the persisted state once on mount (needs a user gesture for audio).
  useEffect(() => {
    if (enabled) {
      // Put the app in storm mode immediately; audio waits for the toggle click.
      document.documentElement.classList.add("storm")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      stop()
      void ctxRef.current?.close().catch(() => {})
    }
  }, [stop])

  return { enabled, toggle, flash }
}