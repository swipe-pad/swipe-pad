"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react"

import { haptic } from "@/lib/haptics"
import type { TopUpStatus } from "@/hooks/use-app-overlays"

const CREDITED_AUTO_DISMISS_MS = 4000

type TopUpStatusToastProps = {
  status: TopUpStatus
  onDismiss: () => void
}

export function TopUpStatusToast({ status, onDismiss }: TopUpStatusToastProps) {
  useEffect(() => {
    if (status.state !== "credited") return
    haptic("credit")
    const timer = setTimeout(onDismiss, CREDITED_AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [status.state, onDismiss])

  return (
    <div className="fixed inset-x-0 top-3 z-130 flex justify-center px-3">
      <motion.div
        key={status.state}
        initial={{ y: -16, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className="surface-panel-strong flex max-w-md items-center gap-3 rounded-2xl border border-surface-border px-4 py-3 text-sm shadow-2xl">
        {status.state === "verifying" ? (
          <>
            <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
            <span className="text-white">Verifying your payment on-chain…</span>
          </>
        ) : status.state === "credited" ? (
          <>
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span className="text-white">+{status.swipes} swipes credited. Happy discovering!</span>
          </>
        ) : (
          <>
            <AlertTriangle className="size-4 shrink-0 text-amber-400" />
            <span className="text-amber-100">{status.message}</span>
            <button
              onClick={onDismiss}
              className="ml-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-white"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
