'use client'

import { useBetaCredits, creditsToSwipes } from '@/hooks/useBetaCredits'
import { cn } from '@/lib/utils'
import { useApp } from '@/context/AppContext'

interface BetaBannerProps {
  chain?: 'celo' | 'base'
  className?: string
}

/**
 * Beta banner showing remaining credits
 * Displays in the app header/layout during beta period
 */
export function BetaBanner({ chain = 'celo', className }: BetaBannerProps) {
  const { betaStatus, creditsRemaining, creditsMax } = useApp()
  const { remaining, max, isLoading } = useBetaCredits(chain)

  const useConvexCredits = betaStatus === "guest" || betaStatus === "active"
  const swipesRemaining = useConvexCredits ? creditsRemaining : creditsToSwipes(remaining)
  const swipesMax = useConvexCredits ? creditsMax : creditsToSwipes(max)
  const percentUsed = swipesMax > 0 ? Math.round(((swipesMax - swipesRemaining) / swipesMax) * 100) : 0

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-2',
        'bg-linear-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10',
        'rounded-xl border border-yellow-500/20 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">🧪</span>
        <span className="text-sm font-medium text-yellow-200/90">
          Beta Mode
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="
          h-1.5 w-20 overflow-hidden rounded-full bg-yellow-900/30
        ">
          <div
            className="
              h-full rounded-full bg-linear-to-r from-yellow-400 to-amber-400
              transition-all duration-500
            "
            style={{ width: `${100 - percentUsed}%` }}
          />
        </div>

        {/* Credits counter */}
        <span className="
          min-w-[60px] text-right font-mono text-sm text-yellow-300/80
        ">
          {useConvexCredits ? (
            `${swipesRemaining}/${swipesMax}`
          ) : isLoading ? (
            <span className="animate-pulse">...</span>
          ) : (
            `${swipesRemaining}/${swipesMax}`
          )}
        </span>
      </div>
    </div>
  )
}

/**
 * Compact version for tight spaces (e.g., header)
 */
export function BetaBadge({ chain = 'celo' }: { chain?: 'celo' | 'base' }) {
  const { remaining, isLoading } = useBetaCredits(chain)
  const swipesRemaining = creditsToSwipes(remaining)

  return (
    <div className="
      flex items-center gap-1.5 rounded-lg border border-yellow-500/20
      bg-yellow-500/10 px-2 py-1
    ">
      <span className="text-xs">🧪</span>
      <span className="font-mono text-xs text-yellow-300/80">
        {isLoading ? '...' : swipesRemaining}
      </span>
    </div>
  )
}
