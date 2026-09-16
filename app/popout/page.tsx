import type { Metadata } from "next"
import { PopoutTimer } from "@/components/synapse/popout-timer"

export const metadata: Metadata = {
  title: "Synapse Timer",
  description: "Mini focus timer pop-out.",
}

export default function PopoutPage() {
  return <PopoutTimer />
}
