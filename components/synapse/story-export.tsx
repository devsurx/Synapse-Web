"use client"

import { toPng } from "html-to-image"
import { Loader2, Share2, X } from "lucide-react"
import { useRef, useState } from "react"
import { getUserName } from "@/lib/profile"
import { formatMinutes, getRank } from "@/lib/ranks"
import { getDayCounts, getStreak, readStats } from "@/lib/stats"

const CARD_W = 1080
const CARD_H = 1920
const PREVIEW_SCALE = 0.24

const SERIF = "Georgia, 'Times New Roman', serif"

interface Snapshot {
  name: string
  minutes: number
  sessions: number
  streak: number
  rankName: string
  week: { minutes: number }[]
  dateLine: string
}

function takeSnapshot(): Snapshot {
  const stats = readStats()
  const { rank } = getRank(stats.focusMinutes)
  const dateLine = new Date().toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
  return {
    name: getUserName() ?? "Focus",
    minutes: stats.focusMinutes,
    sessions: stats.sessions,
    streak: getStreak(),
    rankName: rank.name,
    week: getDayCounts(7),
    dateLine,
  }
}

/**
 * Minimal 9:16 story card — only the user's own numbers, lots of air,
 * system serif so the export renders identically everywhere.
 */
function StoryCard({ snap }: { snap: Snapshot }) {
  const weekMax = Math.max(1, ...snap.week.map((d) => d.minutes))
  return (
    <div
      className="flex flex-col justify-between overflow-hidden text-center"
      style={{
        width: CARD_W,
        height: CARD_H,
        padding: "120px 96px",
        color: "#f2efe4",
        background:
          "radial-gradient(90% 42% at 50% 0%, rgba(157, 200, 157, 0.16) 0%, rgba(157, 200, 157, 0) 70%), linear-gradient(180deg, #141b13 0%, #0b0f0b 58%, #080b08 100%)",
      }}
    >
      {/* top brand */}
      <div>
        <p
          className="uppercase"
          style={{ fontSize: 30, letterSpacing: "0.55em", color: "rgba(242, 239, 228, 0.55)" }}
        >
          Synapse
        </p>
        <div
          className="mx-auto mt-8"
          style={{ width: 72, height: 2, background: "#e3b96a" }}
        />
      </div>

      {/* hero number */}
      <div>
        <p
          className="uppercase"
          style={{ fontSize: 28, letterSpacing: "0.4em", color: "rgba(242, 239, 228, 0.5)" }}
        >
          Deep focus
        </p>
        <p style={{ fontFamily: SERIF, fontSize: 190, lineHeight: 1.1, marginTop: 24 }}>
          {formatMinutes(snap.minutes)}
        </p>
        <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: "rgba(242, 239, 228, 0.75)" }}>
          by {snap.name}
        </p>

        <div
          className="mx-auto flex items-stretch justify-center"
          style={{ gap: 64, marginTop: 88 }}
        >
          {[
            { value: String(snap.sessions), label: "Sessions" },
            { value: String(snap.streak), label: "Day streak" },
            { value: snap.rankName, label: "Rank" },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: SERIF, fontSize: 64 }}>{s.value}</p>
              <p
                className="uppercase"
                style={{ fontSize: 24, letterSpacing: "0.3em", color: "rgba(242, 239, 228, 0.5)", marginTop: 8 }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* last 7 days */}
        <div className="flex items-end justify-center" style={{ gap: 26, marginTop: 96 }}>
          {snap.week.map((d, i) => (
            <div
              key={i}
              style={{
                width: 34,
                height: 10 + Math.round((d.minutes / weekMax) * 120),
                borderRadius: 17,
                background: i === snap.week.length - 1 ? "#e3b96a" : "rgba(242, 239, 228, 0.22)",
              }}
            />
          ))}
        </div>
        <p
          className="uppercase"
          style={{ fontSize: 24, letterSpacing: "0.3em", color: "rgba(242, 239, 228, 0.5)", marginTop: 28 }}
        >
          Last 7 days
        </p>
      </div>

      {/* footer */}
      <div>
        <div
          className="mx-auto"
          style={{ width: "100%", height: 1, background: "rgba(242, 239, 228, 0.16)" }}
        />
        <p
          className="uppercase"
          style={{ fontSize: 26, letterSpacing: "0.35em", color: "rgba(242, 239, 228, 0.55)", marginTop: 36 }}
        >
          {snap.dateLine} · Focus &amp; Grow
        </p>
      </div>
    </div>
  )
}

export function StoryShareButton() {
  const [open, setOpen] = useState(false)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => {
    setSnap(takeSnapshot())
    setOpen(true)
  }

  const exportStory = async () => {
    const node = cardRef.current
    if (!node || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 1 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], "synapse-story.png", { type: "image/png" })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Synapse focus story" })
      } else {
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "synapse-story.png"
        a.click()
      }
    } catch {
      /* sharing cancelled */
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-transform hover:scale-[1.03] active:scale-95"
      >
        <Share2 className="size-3.5" />
        Story
      </button>

      {open && snap && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          {/* scaled preview of the full-size export node */}
          <div
            className="overflow-hidden rounded-2xl shadow-2xl"
            style={{ width: CARD_W * PREVIEW_SCALE, height: CARD_H * PREVIEW_SCALE }}
          >
            <div
              ref={cardRef}
              style={{
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${PREVIEW_SCALE})`,
                transformOrigin: "top left",
              }}
            >
              <StoryCard snap={snap} />
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            style={{ width: CARD_W * PREVIEW_SCALE }}
          >
            <button
              type="button"
              onClick={exportStory}
              disabled={exporting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              {exporting ? "Exporting…" : "Export story"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close story preview"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-white/80 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
