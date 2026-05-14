"use client"

import { X } from "lucide-react"

interface ZeroSwipesGuardrailProps {
  isOpen: boolean
  onClose: () => void
  onTopUp: () => void
}

export function ZeroSwipesGuardrail({ isOpen, onClose, onTopUp }: ZeroSwipesGuardrailProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="surface-panel-strong max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-surface-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-border bg-surface-2/95 px-4 py-3 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white">Out of swipes</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-6 px-4 pt-6 pb-8">
          <p className="text-sm text-white">
            You don&apos;t have swipes available right now. Recharge to keep discovering projects and directing donations.
          </p>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <button
              onClick={onTopUp}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Recharge swipes
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZeroSwipesGuardrail
