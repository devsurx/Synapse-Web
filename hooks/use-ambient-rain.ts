"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Generates a soft, filtered-noise "rain" ambience with the Web Audio API,
 * so no audio asset is needed. Fades in/out to avoid clicks.
 */
export function useAmbientRain() {
  const [enabled, setEnabled] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const stop = useCallback(() => {
    const gain = gainRef.current
    const ctx = ctxRef.current
    if (gain && ctx) {
      const now = ctx.currentTime
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.4)
    }
    const source = sourceRef.current
    if (source) {
      try {
        source.stop((ctx?.currentTime ?? 0) + 0.5)
      } catch {
        /* already stopped */
      }
      sourceRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = ctxRef.current ?? new AudioCtx()
    ctxRef.current = ctx
    if (ctx.state === "suspended") void ctx.resume()

    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      // low-pass smoothing => brown-ish noise that reads as gentle rain
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 1100

    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.6)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()

    sourceRef.current = source
    gainRef.current = gain
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (next) start()
      else stop()
      return next
    })
  }, [start, stop])

  useEffect(() => {
    return () => {
      stop()
      void ctxRef.current?.close()
    }
  }, [stop])

  return { enabled, toggle }
}
