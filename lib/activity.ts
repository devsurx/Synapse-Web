export interface SquadMember {
  id: string
  name: string
  focusMinutes: number
  color: string
  isYou?: boolean
}

export interface Squad {
  id: string
  code: string
  name: string
  members: SquadMember[]
  createdAt: number
}

export interface Cheer {
  name: string
  at: number
}

const SQUAD_KEY = "synapse:squad"
const CHEERS_KEY = "synapse:squad-cheers"
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateCode(): string {
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return code
}

export function loadSquad(): Squad | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SQUAD_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.code || !Array.isArray(parsed?.members)) return null
    return parsed as Squad
  } catch {
    return null
  }
}

function saveSquad(squad: Squad) {
  try {
    window.localStorage.setItem(SQUAD_KEY, JSON.stringify(squad))
  } catch {}
}

export function createSquad(name: string, you: SquadMember): Squad {
  const squad: Squad = {
    id: `sq-${Date.now()}`,
    code: generateCode(),
    name: name.trim() || "My Squad",
    members: [you, ...sampleMembers(2)],
    createdAt: Date.now(),
  }
  saveSquad(squad)
  return squad
}

export function joinSquad(code: string, name: string, you: SquadMember): Squad {
  const squad: Squad = {
    id: `sq-${Date.now()}`,
    code: code.toUpperCase().trim() || generateCode(),
    name: name.trim() || "Squad",
    members: [you, ...sampleMembers(3)],
    createdAt: Date.now(),
  }
  saveSquad(squad)
  return squad
}

export function updateMember(member: SquadMember): Squad | null {
  const squad = loadSquad()
  if (!squad) return null
  const idx = squad.members.findIndex((m) => m.id === member.id)
  if (idx === -1) return squad
  squad.members[idx] = member
  saveSquad(squad)
  return squad
}

export function addMember(member: SquadMember): Squad | null {
  const squad = loadSquad()
  if (!squad) return null
  squad.members.push(member)
  saveSquad(squad)
  return squad
}

export function removeMember(id: string): Squad | null {
  const squad = loadSquad()
  if (!squad) return null
  squad.members = squad.members.filter((m) => m.id !== id)
  saveSquad(squad)
  return squad
}

export function leaveSquad() {
  try {
    window.localStorage.removeItem(SQUAD_KEY)
  } catch {}
}

export function loadCheers(): Cheer[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(CHEERS_KEY) || "[]") as Cheer[]
  } catch {
    return []
  }
}

export function pushCheer(name: string): Cheer[] {
  const cheers = [ { name, at: Date.now() }, ...loadCheers() ].slice(0, 20)
  try {
    window.localStorage.setItem(CHEERS_KEY, JSON.stringify(cheers))
  } catch {}
  return cheers
}

const COLORS = ["#a3e635", "#7ec8f5", "#f5c542", "#c084fc", "#fb7d9c", "#6dd5d0"]

function sampleMembers(count: number): SquadMember[] {
  const names = ["Mira", "Kai", "Aria", "Leo", "Nina", "Theo"]
  return names.slice(0, count).map((name, i) => ({
    id: `m-${name}-${i}`,
    name,
    focusMinutes: 420 + Math.floor(Math.random() * 7200),
    color: COLORS[(i + 1) % COLORS.length],
  }))
}