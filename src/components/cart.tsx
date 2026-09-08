"use client"

import { useState, useMemo } from "react"
import { useMutation } from "convex/react"
import type { Project } from "@/lib/useConvexData"
import type { StableCoin } from "@/components/amount-selector"
import { useBetaDonation } from "@/hooks/useBetaDonation"
import {
  clearPendingDonationTx,
  describeDonationFailure,
  pendingDonationBelongsTo,
  readPendingDonationTx,
  writePendingDonationTx,
  type DonationBatchItem,
  type DonationOutcome,
  type PendingDonationTx,
} from "@/lib/donation-outcome"
import { getDonationExplorerLinks, shortenHash } from "@/lib/donation-history"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

interface CartItem {
  project: Project
  amount: number
  currency: StableCoin
}

/**
 * Only acknowledged outcomes reach the success screen: an on-chain receipt
 * with status success, or a Convex ack that the ledger row was written.
 * `items` is the batch that was actually settled — the cart drops exactly
 * those entries, nothing else.
 */
export type CheckoutResult =
  | { mode: "onchain"; status: "confirmed"; txHash: string; donationId: string | null; items: DonationBatchItem[] }
  | { mode: "ledger"; status: "recorded"; donationId: string; items: DonationBatchItem[] }

interface CartProps {
  items: CartItem[]
  betaUserId: string | null
  onClose: () => void
  onCheckout: (result: CheckoutResult) => void
}

type CheckoutFailure = {
  title: string
  detail: string
  txHash: string | null
  canResend: boolean
  canRecheck: boolean
}

function getLocalStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage
}

function failureFromOutcome(outcome: Exclude<DonationOutcome, { status: "confirmed" }>): CheckoutFailure {
  const copy = describeDonationFailure(outcome)
  return {
    title: copy.title,
    detail: copy.detail,
    txHash: "txHash" in outcome ? outcome.txHash : null,
    canResend: copy.canResend,
    canRecheck: copy.canRecheck,
  }
}

function unconfirmedFailure(txHash: string): CheckoutFailure {
  return failureFromOutcome({ status: "unknown", txHash, error: new Error("Receipt not confirmed yet") })
}

function toBatchItems(items: CartItem[]): DonationBatchItem[] {
  return items.map((item) => ({ projectId: item.project.projectId, amount: item.amount, currency: item.currency }))
}

export function Cart({ items, betaUserId, onClose, onCheckout }: CartProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [failure, setFailure] = useState<CheckoutFailure | null>(null)
  // A previous broadcast that never got a receipt. Read once; stale (>24h)
  // and legacy references are dropped by the reader.
  const [pendingTx, setPendingTx] = useState<PendingDonationTx | null>(() => readPendingDonationTx(getLocalStorage()))
  const { donate, checkTransaction, phase, canDonateOnchain } = useBetaDonation("celo")
  const recordDonationBatch = useMutation(api.donations.recordDonationBatch)

  // Only the account that broadcast the batch may recheck or record it. Another
  // account on this device sees a normal cart; the reference stays stored for its owner.
  const activePending = pendingTx && pendingDonationBelongsTo(pendingTx, betaUserId) ? pendingTx : null

  // Re-open in "check status" mode while a broadcast is unconfirmed, so the
  // primary action can't become a second send — even when the cart is empty.
  const displayedFailure = failure ?? (activePending ? unconfirmedFailure(activePending.txHash) : null)

  const isBusy = phase !== "idle" || isRecording

  const totals = useMemo(() => {
    const result: Record<StableCoin, number> = {
      cUSD: 0,
      USDC: 0,
      USDT: 0,
    }

    items.forEach((item) => {
      result[item.currency] += item.amount
    })

    return result
  }, [items])

  /**
   * Records `batch` — the items that were actually sent — never the live cart.
   * After a reload the cart may hold new, undonated items while the batch
   * being confirmed is the one saved with the pending reference.
   */
  const persistBatch = async (batch: DonationBatchItem[], settlement: "ledger" | "onchain", txHash?: string) => {
    if (!betaUserId) throw new Error("No beta account is active")
    return await recordDonationBatch({
      userId: betaUserId as Id<"waitlistUsers">,
      chain: "celo",
      items: batch.map((item) => ({ projectId: item.projectId, amount: item.amount })),
      settlement,
      txHash,
    })
  }

  const forgetPending = () => {
    clearPendingDonationTx(getLocalStorage())
    setPendingTx(null)
  }

  const handleOutcome = async (outcome: DonationOutcome, batch: DonationBatchItem[]) => {
    if (outcome.status === "unknown") {
      const pending: PendingDonationTx = {
        txHash: outcome.txHash,
        userId: betaUserId,
        items: batch,
        // Keep the original broadcast time across rechecks so the age bound holds.
        createdAt: pendingTx?.txHash === outcome.txHash ? pendingTx.createdAt : Date.now(),
      }
      writePendingDonationTx(getLocalStorage(), pending)
      setPendingTx(pending)
    } else {
      forgetPending()
    }

    if (outcome.status === "confirmed") {
      // The receipt is the source of truth; the ledger row is history only, so
      // a failure to write it must not turn a confirmed donation into an error.
      let donationId: string | null = null
      try {
        donationId = (await persistBatch(batch, "onchain", outcome.txHash)).donationId
      } catch (err) {
        console.error("Confirmed on-chain but failed to record donation history:", err)
      }
      onCheckout({ mode: "onchain", status: "confirmed", txHash: outcome.txHash, donationId, items: batch })
      return
    }

    setFailure(failureFromOutcome(outcome))
  }

  const handleCheckout = async () => {
    // An unconfirmed broadcast must be settled (or dismissed) before anything new is sent.
    if (items.length < 5 || isBusy || activePending) {
      return
    }

    setFailure(null)
    const batch = toBatchItems(items)

    // No wallet or pool not deployed for this env: the donation is recorded in
    // the Convex beta ledger only (SP-1003 Option B). The success screen may
    // only claim "recorded" after Convex acknowledges the write.
    if (!canDonateOnchain) {
      if (!betaUserId) {
        setFailure({
          title: "Connect a wallet to record your donation.",
          detail: "Nothing was recorded and no funds moved. Your selection is safe.",
          txHash: null,
          canResend: true,
          canRecheck: false,
        })
        return
      }

      setIsRecording(true)
      try {
        const { donationId } = await persistBatch(batch, "ledger")
        onCheckout({ mode: "ledger", status: "recorded", donationId, items: batch })
      } catch (err) {
        console.error("Failed to record ledger donation:", err)
        setFailure({
          title: "We couldn't record your donation.",
          detail: `${err instanceof Error ? err.message : String(err)}. Nothing was recorded and no funds moved — your selection is safe, retry in a moment.`,
          txHash: null,
          canResend: true,
          canRecheck: false,
        })
      } finally {
        setIsRecording(false)
      }
      return
    }

    await handleOutcome(await donate(items), batch)
  }

  const handleRecheck = async () => {
    const pending = activePending
    if (!pending || isBusy) return
    setFailure(null)
    // Attribute the result to the batch that was broadcast, not to the cart.
    await handleOutcome(await checkTransaction(pending.txHash), pending.items)
  }

  const handleDismissPending = () => {
    if (isBusy) return
    forgetPending()
    setFailure(null)
  }

  const isRecheck = Boolean(displayedFailure?.canRecheck && activePending)
  const primaryAction = isRecheck ? handleRecheck : handleCheckout
  const primaryLabel = isRecheck ? "Check transaction status" : displayedFailure ? "Retry Donation" : "Confirm Donation"
  const primaryEnabled = isRecheck ? !isBusy : items.length >= 5 && !isBusy
  const showPrimary = items.length > 0 || isRecheck
  const busyLabel = isRecording
    ? "Recording your donation…"
    : phase === "submitting"
      ? "Waiting for your wallet…"
      : "Confirming on Celo…"
  const explorer = getDonationExplorerLinks(displayedFailure?.txHash ?? null)

  return (
    <div className="
      fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4
    " onClick={onClose}>
      <div className="
        surface-panel-strong flex max-h-[80vh] w-full max-w-md flex-col
        rounded-2xl border border-surface-border p-6 shadow-2xl
      " onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Your Donations</h3>
            <p className="mt-1 text-xs text-gray-400">Spread your donation across at least 5 projects.</p>
          </div>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6">
              {items.map((item, index) => (
                <div key={index} className="
                  flex justify-between border-b border-gray-700 py-3
                ">
                  <div>
                    <h4 className="font-medium">{item.project.name}</h4>
                    <p className="text-sm text-gray-400">{item.project.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {item.amount} {item.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4">
              <div className="mb-6">
                <h4 className="mb-2 font-medium">Total by Currency:</h4>
                {Object.entries(totals).map(
                  ([currency, amount]) =>
                    amount > 0 && (
                      <div key={currency} className="
                        mb-1 flex justify-between text-sm
                      ">
                        <span>{currency}:</span>
                        <span className="font-bold">{amount.toFixed(2)}</span>
                      </div>
                    ),
                )}
              </div>

              {items.length < 5 ? (
                <div className="
                  mb-4 rounded-lg bg-yellow-900/30 p-3 text-sm text-yellow-300
                ">
                  Please select {5 - items.length} more project{items.length === 4 ? "" : "s"} to proceed
                </div>
              ) : null}
            </div>
          </>
        )}

        {/* Outcome + primary action live outside the item list: an unconfirmed
            broadcast must stay visible and re-checkable even with an empty cart. */}
        {displayedFailure ? (
          <div
            className={`mb-4 rounded-lg p-3 text-sm ${displayedFailure.canRecheck ? "bg-amber-900/30 text-amber-200" : "bg-red-900/30 text-red-300"}`}
            role="alert"
          >
            <p className="font-medium">{displayedFailure.title}</p>
            <p className={`mt-1 text-xs ${displayedFailure.canRecheck ? "text-amber-100/80" : "text-red-200/80"}`}>{displayedFailure.detail}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {displayedFailure.txHash && explorer.celoscan ? (
                <a
                  href={explorer.celoscan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-mono text-xs underline underline-offset-2"
                >
                  {shortenHash(displayedFailure.txHash)}
                </a>
              ) : null}
              {isRecheck ? (
                <button
                  type="button"
                  onClick={handleDismissPending}
                  disabled={isBusy}
                  className="text-xs underline underline-offset-2 hover:text-white disabled:opacity-50"
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {showPrimary ? (
          <button
            onClick={primaryAction}
            disabled={!primaryEnabled}
            className={`
              w-full rounded-lg py-3 font-medium transition-colors
              ${
              primaryEnabled
                ? `
                  bg-[#677FEB] text-white
                  hover:bg-[#5A6FD3]
                `
                : "cursor-not-allowed bg-gray-700 text-gray-400"
            }
            `}
          >
            {isBusy ? (
              <span className="flex items-center justify-center">
                <svg
                  className="mr-2 -ml-1 size-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {busyLabel}
              </span>
            ) : (
              primaryLabel
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
