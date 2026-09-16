import type { Metadata } from "next"
import { SynapseApp } from "@/components/synapse/synapse-app"

const SITE_URL = "https://synapseapp.com"
const TITLE = "Synapse — Focus & Learn Smarter"
const DESCRIPTION =
  "A calm focus companion. Run deep-work sessions, grow your streak, and learn any concept with built-in tools like the Feynman technique, ELI5, flashcards, and spaced review."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Synapse",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Synapse" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
}

export default function Page() {
  return <SynapseApp />
}
