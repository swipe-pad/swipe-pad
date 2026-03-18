"use client"

import { useRef, type MouseEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useShallow } from "zustand/react/shallow"

import { useApp } from "@/context/AppContext"
import { FarcasterMiniAppPrompt } from "@/components/farcaster-miniapp-prompt"
import { ChevronDownIcon } from "@/components/icons"

interface AppHeaderProps {
  donationAmountLabel: string
  onOpenDonationSetup: () => void
}

export function AppHeader({ donationAmountLabel, onOpenDonationSetup }: AppHeaderProps) {
  const router = useRouter()
  const isDev = process.env.NODE_ENV !== "production"
  const logoClickTimestampsRef = useRef<number[]>([])

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isDev) return

    const now = Date.now()
    const recent = logoClickTimestampsRef.current.filter((stamp) => now - stamp < 900)
    recent.push(now)
    logoClickTimestampsRef.current = recent

    if (recent.length >= 3) {
      event.preventDefault()
      logoClickTimestampsRef.current = []
      router.push("/dev/settings")
    }
  }

  const { walletConnected, creditsRemaining } = useApp(
    useShallow((state) => ({
      walletConnected: state.walletConnected,
      creditsRemaining: state.creditsRemaining,
    }))
  )

  return (
    <header className="view-header bg-transparent">
      <div className="px-3 py-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="font-display text-xs font-bold tracking-wide text-white transition-colors hover:text-primary"
          >
            SwipePad
          </Link>

          <button
            onClick={onOpenDonationSetup}
            className="mx-auto flex shrink-0 items-center rounded-full border border-surface-border bg-[#25314d]/75 px-2.5 py-1 text-[11px] transition-colors hover:bg-[#2b3a5a]"
            aria-label="Open donation setup"
          >
            <span className="mr-1 inline-flex size-1.5 rounded-full bg-emerald-400" />
            <span className="mr-1 font-semibold text-white">{donationAmountLabel}</span>
            <span className="text-muted-foreground">
              <ChevronDownIcon />
            </span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {walletConnected ? (
              <>
                <span className="text-xs text-muted-foreground">{creditsRemaining} swipes</span>
                <button onClick={onOpenDonationSetup} className="btn-sm btn-ghost hover:bg-[#2b3a5a]">
                  Add Funds
                </button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Connect wallet to top up</span>
            )}
          </div>
        </div>

        <FarcasterMiniAppPrompt />
      </div>
    </header>
  )
}
