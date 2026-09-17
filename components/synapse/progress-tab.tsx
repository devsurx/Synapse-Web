"use client"

import { AppPromoSection } from "./app-promo"
import { StoryShareButton } from "./story-export"
import { StreakBar } from "./streak-bar"

/**
 * Personal space: only the user's own focus data, story export,
 * and the mobile app download. Kept off the home screen so
 * focus stays clean and minimal.
 */
export function ProgressTab() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 className="font-serif text-2xl text-foreground">Your progress</h2>
        <StoryShareButton />
      </div>
      <StreakBar />
      <AppPromoSection />
    </div>
  )
}
