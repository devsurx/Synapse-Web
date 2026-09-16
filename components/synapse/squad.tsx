"use client"

import { toPng } from "html-to-image"
import {
  Check,
  Copy,
  Loader2,
  PartyPopper,
  Plus,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { getRank } from "@/lib/ranks"
import { readStats, subscribeStats } from "@/lib/stats"
import {
  addMember,
  createSquad,
  joinSquad,
  leaveSquad,
  loadCheers,
  loadSquad,
  pushCheer,
  type Cheer,
  type Squad,
  type SquadMember,
} from "@/lib/activity"
import { RankChip } from "./rank-chip"

interface SquadTabProps {
  onDismiss?: () => void
}

export function SquadTab({}: SquadTabProps) {
  const [squad, setSquad] = useState<Squad | null>(() => loadSquad())
  const [youMinutes, setYouMinutes] = useState(() => readStats().focusMinutes)
  const [cheers, setCheers] = useState<Cheer[]>(() => loadCheers())
  const [mode, setMode] = useState<"create" | "join">("create")
  const [newName, setNewName] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [copied, setCopied] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [celebrate, setCelebrate] = useState<string | null>(null)
  const shareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = subscribeStats((s) => setYouMinutes(s.focusMinutes))
    return unsub
  }, [])

  const you: SquadMember = {
    id: "me",
    name: "You",
    focusMinutes: youMinutes,
    color: "#a3e635",
    isYou: true,
  }

  const handleCreate = () => {
    if (!newName.trim()) return
    setSquad(createSquad(newName, you))
    setNewName("")
  }

  const handleJoin = () => {
    if (!joinCode.trim()) return
    setSquad(joinSquad(joinCode, `Squad ${joinCode.trim().toUpperCase()}`, you))
    setJoinCode("")
  }

  const handleLeave = () => {
    leaveSquad()
    setSquad(null)
  }

  const copyCode = () => {
    if (!squad) return
    void navigator.clipboard?.writeText(squad.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleInvite = () => {
    if (!squad || !inviteName.trim()) return
    const next = addMember({
      id: `m-${Date.now()}`,
      name: inviteName.trim(),
      focusMinutes: 0,
      color: "#c084fc",
    })
    if (next) setSquad(next)
    setInviteName("")
  }

  const handleCheer = () => {
    if (!squad || squad.members.length < 2) return
    const others = squad.members.filter((m) => !m.isYou)
    const target = others[Math.floor(Math.random() * others.length)]
    setCheers(pushCheer(`${you.name} cheered ${target.name}`))
    setCelebrate(target.id)
    setTimeout(() => setCelebrate(null), 1800)
  }

  const exportCard = async () => {
    const node = shareRef.current
    if (!node || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(node, { width: 1080, height: 1920, pixelRatio: 2 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], "synapse-squad.png", { type: "image/png" })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Join my Synapse squad" })
      } else {
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "synapse-squad.png"
        a.click()
      }
    } catch {
      /* sharing cancelled */
    } finally {
      setExporting(false)
      setCardOpen(false)
    }
  }

  if (!squad) {
    return (
      <div className="flex h-full flex-col gap-4 px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Users className="size-4" strokeWidth={2} />
          </span>
          <h2 className="font-serif text-2xl text-foreground">Squad</h2>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-1">
          {(["create", "join"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors",
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "create" ? (
          <form
            className="flex flex-1 flex-col items-start gap-3 rounded-2xl border border-border bg-card/40 p-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleCreate()
            }}
          >
            <label className="text-sm text-muted-foreground">Give your squad a name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Midnight Grinders"
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Sparkles className="size-4" />
              Create squad
            </button>
          </form>
        ) : (
          <form
            className="flex flex-1 flex-col items-start gap-3 rounded-2xl border border-border bg-card/40 p-5"
            onSubmit={(e) => {
              e.preventDefault()
              handleJoin()
            }}
          >
            <label className="text-sm text-muted-foreground">Enter the invite code from a friend</label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="w-full rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm uppercase tracking-widest text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
            />
            <button
              type="submit"
              disabled={!joinCode.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Users className="size-4" />
              Join squad
            </button>
          </form>
        )}
      </div>
    )
  }

  const totalMinutes = squad.members.reduce((a, m) => a + m.focusMinutes, 0)
  const sorted = [...squad.members].sort((a, b) => Number(b.isYou) - Number(a.isYou) || b.focusMinutes - a.focusMinutes)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-6 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Users className="size-4" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-2xl text-foreground">{squad.name}</h2>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? <Check className="size-3 text-accent" /> : <Copy className="size-3" />}
              Code {squad.code}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={handleLeave}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3.5" />
            Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {sorted.map((member) => {
          const { rank, next } = getRank(member.focusMinutes)
          return (
            <div
              key={member.id}
              className={cn(
                "flex flex-col gap-2 rounded-2xl border bg-card/50 p-4 transition-transform",
                celebrate === member.id && "scale-105 border-accent/50",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex size-8 items-center justify-center rounded-full text-base"
                  style={{ backgroundColor: `${member.color}22`, color: member.color }}
                >
                  {member.name[0]?.toUpperCase()}
                </span>
                {member.isYou && (
                  <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
                    You
                  </span>
                )}
              </div>
              <p className="truncate text-sm font-medium text-foreground">{member.name}</p>
              <RankChip rank={rank} next={next} progress={0} focusMinutes={member.focusMinutes} compact={false} />
              <p className="text-xs text-muted-foreground">{member.focusMinutes} min focused</p>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-foreground">Squad focus</span>
          <span className="text-muted-foreground">{Math.round(totalMinutes / 60)}h combined</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-accent transition-all duration-500"
            style={{ width: `${Math.min((totalMinutes / 24000) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCheer}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          <PartyPopper className="size-4" />
          Cheer a squadmate
        </button>
        <div className="flex flex-1 items-center gap-2">
          <input
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInvite()
            }}
            placeholder="Add a member by name…"
            className="min-w-0 flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
          />
          <button
            type="button"
            onClick={handleInvite}
            disabled={!inviteName.trim()}
            aria-label="Add member"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {cheers.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/40 p-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Activity</p>
          {cheers.slice(0, 4).map((cheer) => (
            <p key={cheer.at} className="text-sm text-foreground/90">
              <span className="text-accent">✦</span> {cheer.name}
            </p>
          ))}
        </div>
      )}

      {cardOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-4 backdrop-blur-sm">
          <div
            ref={shareRef}
            className="flex h-[440px] w-[247px] flex-col justify-between overflow-hidden rounded-[2rem] p-5 text-white shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #1b2438 0%, #0c1120 55%, #16213a 100%)",
            }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Synapse Squad</p>
              <h3 className="mt-1 text-2xl font-bold leading-tight">{squad.name}</h3>
              <p className="mt-1 text-sm opacity-80">Invite code · {squad.code}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Top focused</p>
              <div className="mt-2 space-y-2">
                {sorted
                  .filter((m) => !m.isYou)
                  .slice(0, 2)
                  .map((m) => {
                    const { rank } = getRank(m.focusMinutes)
                    return (
                      <div key={m.id} className="flex items-center gap-2">
                        <span
                          className="flex size-7 items-center justify-center rounded-full text-xs font-bold"
                          style={{ backgroundColor: `${m.color}33`, color: m.color }}
                        >
                          {m.name[0]}
                        </span>
                        <span className="text-xs">
                          {m.name} · {rank.name}
                        </span>
                        <span className="ml-auto text-xs opacity-70">{m.focusMinutes}m</span>
                      </div>
                    )
                  })}
              </div>
              <p className="mt-4 text-center text-[13px] font-semibold">Join me on Synapse ✦</p>
            </div>
          </div>
          <div className="flex w-[247px] items-center gap-2">
            <button
              type="button"
              onClick={exportCard}
              disabled={exporting}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              {exporting ? "Exporting…" : "Export story"}
            </button>
            <button
              type="button"
              onClick={() => setCardOpen(false)}
              aria-label="Close share card"
              className="inline-flex size-11 items-center justify-center rounded-full border border-border text-white/80 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}