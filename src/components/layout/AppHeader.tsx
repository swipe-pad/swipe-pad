"use client"

import Link from "next/link"
import { Award, Flame } from "lucide-react"

import { CartIcon, ChevronDownIcon } from "@/components/icons"

interface AppHeaderProps {
  donationAmountLabel: string
  cartCount: number
  isTrendingActive: boolean
  isLeaderboardActive: boolean
  onOpenCart: () => void
  onOpenDonationSetup: () => void
}

export function AppHeader({
  donationAmountLabel,
  cartCount,
  isTrendingActive,
  isLeaderboardActive,
  onOpenCart,
  onOpenDonationSetup,
}: AppHeaderProps) {
  return (
    <header className="view-header sticky top-0 z-40 bg-transparent">
      <div className="px-3 py-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link href="/" className="font-display text-base font-bold tracking-widest text-white transition-colors hover:text-primary">
            SwipePad
          </Link>

          <button
            onClick={onOpenDonationSetup}
            className="mx-auto flex shrink-0 items-center rounded-full border border-surface-border bg-[#25314d]/75 px-3 py-1.5 text-xs transition-colors hover:bg-[#2b3a5a]"
            aria-label="Open donation setup"
          >
            <span className="mr-1 inline-flex size-2 rounded-full bg-emerald-400" />
            <span className="mr-1 font-semibold text-white">{donationAmountLabel}</span>
            <span className="text-muted-foreground"><ChevronDownIcon /></span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Link
              aria-label="Open trending"
              href="/trending"
              className={`flex size-10 items-center justify-center rounded-full transition-all ${
                isTrendingActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#23314f] text-white hover:bg-[#2e4066]"
              }`}
            >
              <Flame className="size-4" />
            </Link>

            <button
              aria-label="Open cart"
              className="relative flex size-10 items-center justify-center rounded-full bg-[#6a86ff] text-white transition-colors hover:brightness-110"
              onClick={onOpenCart}
            >
              <CartIcon />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </button>

            <Link
              aria-label="Open leaderboard"
              href="/leaderboard"
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                isLeaderboardActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#23314f] text-[#F9DE4B] hover:bg-[#2e4066]"
              }`}
            >
              <Award className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
