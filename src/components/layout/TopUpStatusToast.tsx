"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw, X } from "lucide-react"

import { haptic } from "@/lib/haptics"
import { getDonationExplorerLinks, shortenHash } from "@/lib/donation-history"
import type { TopUpStatus } from "@/lib/top-up-recovery"

const CREDITED_AUTO_DISMISS_MS = 5000

type TopUpStatusToastProps = {
  status: TopUpStatus
  onDismiss: () => void
  /** Re-verifies the saved payment reference. Never starts a new payment. */
  onRetry: () => void
}

function TxLink({ txHash }: { txHash: string }) {
  const { celoscan } = getDonationExplorerLinks(txHash)
  if (!celoscan) return null
  return (
    <a
      href={celoscan}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[11px] text-muted-foreground underline underline-offset-2 hover:text-white"
    >
      {shortenHash(txHash)}
    </a>
  )
}

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      onClick={onDismiss}
      className="ml-1 shrink-0 self-start rounded-md p-1 text-muted-foreground transition-colors hover:text-white"
      aria-label="Dismiss"
    >
      <X className="size-4" />
    </button>
  )
}

function RetryButton({ onRetry, label }: { onRetry: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/10"
    >
      <RefreshCw className="size-3" />
      {label}
    </button>
  )
}

export function TopUpStatusToast({ status, onDismiss, onRetry }: TopUpStatusToastProps) {
  const isCredited = status.state === "credited" || status.state === "already-credited"

  useEffect(() => {
    if (!isCredited) return
    if (status.state === "credited") haptic("credit")
    const timer = setTimeout(onDismiss, CREDITED_AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [isCredited, status.state, onDismiss])

  return (
    <div className="fixed inset-x-0 top-3 z-130 flex justify-center px-3" role="status" aria-live="polite">
      <motion.div
        key={status.state}
        initial={{ y: -16, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className="surface-panel-strong flex max-w-md items-start gap-3 rounded-2xl border border-surface-border px-4 py-3 text-sm shadow-2xl"
      >
        {status.state === "verifying" ? (
          <>
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
            <div className="flex flex-col gap-1">
              <span className="text-white">Verifying your payment on Celo…</span>
              <TxLink txHash={status.txHash} />
            </div>
          </>
        ) : status.state === "pending" ? (
          <>
            <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
            <div className="flex flex-col gap-2">
              <span className="text-white">
                {status.willRetry
                  ? "Payment sent. Celo hasn't confirmed it yet — we keep checking and will credit your swipes once it lands."
                  : "We couldn't find this transaction on Celo after several checks. Nothing has been credited yet."}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <RetryButton onRetry={onRetry} label="Check now" />
                <TxLink txHash={status.txHash} />
              </div>
            </div>
            <DismissButton onDismiss={onDismiss} />
          </>
        ) : status.state === "credited" ? (
          <>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            <div className="flex flex-col gap-1">
              <span className="text-white">+{status.swipes} swipes credited. Happy discovering!</span>
              <TxLink txHash={status.txHash} />
            </div>
          </>
        ) : status.state === "already-credited" ? (
          <>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
            <div className="flex flex-col gap-1">
              <span className="text-white">
                This payment was already credited ({status.swipes} swipes). Your balance is up to date.
              </span>
              <TxLink txHash={status.txHash} />
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div className="flex flex-col gap-2">
              <span className="text-amber-100">{status.message}</span>
              <div className="flex flex-wrap items-center gap-2">
                {status.retryable ? <RetryButton onRetry={onRetry} label="Retry verification" /> : null}
                {status.txHash ? <TxLink txHash={status.txHash} /> : null}
              </div>
            </div>
            <DismissButton onDismiss={onDismiss} />
          </>
        )}
      </motion.div>
    </div>
  )
}
