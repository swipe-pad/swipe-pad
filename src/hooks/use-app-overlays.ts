"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAction, useQuery } from "convex/react"
import { useShallow } from "zustand/react/shallow"

import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import type { TopUpVerifyOutcome } from "../../convex/topupsLib"
import { useApp } from "@/context/AppContext"
import { useProjects } from "@/lib/useConvexData"
import { dispatchCheckoutSettled } from "@/lib/checkout-event"
import { splitSettledCartItems } from "@/lib/donation-outcome"
import { TOP_UP_DIALOG_EVENT, type TopUpDialogDetail } from "@/lib/top-up-dialog"
import {
  clearPendingTopUp,
  missingTxHashStatus,
  readPendingTopUp,
  topUpOutcomeToStatus,
  topUpRecordToStatus,
  verificationErrorToStatus,
  writePendingTopUp,
  type PendingTopUp,
  type TopUpStatus,
} from "@/lib/top-up-recovery"
import type { CheckoutResult } from "@/components/cart"
import type { ConfirmSwipes, DonationAmount, StableCoin } from "@/components/amount-selector"
import type { EditProfileFormData } from "@/components/edit-profile"

export type TopUpSuccessInput = { planId: string; txHash: string | null }

function getLocalStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage
}

type CartCategoryItem = {
  project?: {
    category?: string
  }
}

type UseAppOverlaysOptions = {
  /**
   * Only the instance that renders <AppOverlays> (the app layout) should own
   * top-up recovery; a second instance would double-verify every payment and
   * the loser would misreport "already credited" for a brand-new credit.
   */
  ownsTopUpRecovery?: boolean
}

export function useAppOverlays({ ownsTopUpRecovery = true }: UseAppOverlaysOptions = {}) {
  const projects = useProjects()
  const {
    cart,
    setCart,
    userStats,
    userProfile,
    setUserProfile,
    setDonationAmount,
    setDonationCurrency,
    setConfirmSwipes,
    setSwipeCount,
    walletAddress,
    creditsRemaining,
    creditsMax,
    betaUserId,
    setCreditsRemaining,
    setCreditsMax,
  } = useApp(useShallow((state) => ({
    cart: state.cart,
    setCart: state.setCart,
    userStats: state.userStats,
    userProfile: state.userProfile,
    setUserProfile: state.setUserProfile,
    setDonationAmount: state.setDonationAmount,
    setDonationCurrency: state.setDonationCurrency,
    setConfirmSwipes: state.setConfirmSwipes,
    setSwipeCount: state.setSwipeCount,
    walletAddress: state.walletAddress,
    creditsRemaining: state.creditsRemaining,
    creditsMax: state.creditsMax,
    betaUserId: state.betaUserId,
    setCreditsRemaining: state.setCreditsRemaining,
    setCreditsMax: state.setCreditsMax,
  })))

  const verifyTopUp = useAction(api.topups.verifyAndCredit)

  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showBadgeNotification, setShowBadgeNotification] = useState(false)
  const [currentBadge] = useState("")
  const [showProfileQuickView, setShowProfileQuickView] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showDonationSetup, setShowDonationSetup] = useState(false)
  const [showTopUp, setShowTopUp] = useState(false)
  const [topUpReason, setTopUpReason] = useState<string | undefined>()
  const [topUpDefaultPlanId, setTopUpDefaultPlanId] = useState<string | undefined>()
  const [showZeroSwipesGuardrail, setShowZeroSwipesGuardrail] = useState(false)
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartCategoryItem[]>([])
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [topUpStatus, setTopUpStatus] = useState<TopUpStatus | null>(null)
  // Payment reference we are still trying to settle. Seeded from localStorage
  // so a reload (or a tab closed mid-verification) resumes instead of dropping it.
  const [trackedTopUp, setTrackedTopUp] = useState<PendingTopUp | null>(() =>
    ownsTopUpRecovery ? readPendingTopUp(getLocalStorage()) : null
  )
  const verifyingRef = useRef(false)
  const autoVerifiedKeyRef = useRef<string | null>(null)

  const trackedTopUpRecord = useQuery(
    api.topups.getTopUpStatus,
    ownsTopUpRecovery && trackedTopUp && betaUserId
      ? { userId: betaUserId as Id<"waitlistUsers">, txHash: trackedTopUp.txHash }
      : "skip"
  )
  const unresolvedTopUps = useQuery(
    api.topups.listUnresolvedTopUps,
    ownsTopUpRecovery && betaUserId ? { userId: betaUserId as Id<"waitlistUsers"> } : "skip"
  )

  useEffect(() => {
    const handleOpenTopUp = (event: Event) => {
      const detail = (event as CustomEvent<TopUpDialogDetail>).detail
      setTopUpReason(detail?.reason)
      setTopUpDefaultPlanId(detail?.defaultPlanId)
      setShowTopUp(true)
    }

    window.addEventListener(TOP_UP_DIALOG_EVENT, handleOpenTopUp)
    return () => window.removeEventListener(TOP_UP_DIALOG_EVENT, handleOpenTopUp)
  }, [])

  const categoriesFromCheckout = useMemo(() => {
    return [
      ...new Set(
        checkoutSnapshot
          .map((item) => item?.project?.category)
          .filter((category): category is string => Boolean(category))
      ),
    ]
  }, [checkoutSnapshot])

  const recentDonations = useMemo(() => {
    return cart.slice(0, 5).map((item) => ({ ...item, date: new Date() }))
  }, [cart])

  const handleCheckout = (result: CheckoutResult) => {
    // Only the entries this checkout actually settled leave the cart. A
    // recovered transaction (rechecked after a reload) must not swallow items
    // the user added since — those were never sent anywhere.
    const { settled, remaining } = splitSettledCartItems(cart, result.items)
    setCheckoutResult(result)
    setCheckoutSnapshot(settled as CartCategoryItem[])
    setShowCart(false)
    setShowSuccess(true)
    setCart(remaining)
    // Undo history for the settled swipes is now meaningless (see checkout-event.ts).
    dispatchCheckoutSettled()
  }

  const handleSaveProfile = (data: EditProfileFormData) => {
    setUserProfile((prev) => ({ ...prev, ...data }))
  }

  const handleDonationSetupSelect = (amount: DonationAmount, currency: StableCoin, swipes: ConfirmSwipes) => {
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => {
        setDonationAmount(amount)
        setDonationCurrency(currency)
        setConfirmSwipes(swipes)
        setSwipeCount(0)
      })
      return
    }

    setDonationAmount(amount)
    setDonationCurrency(currency)
    setConfirmSwipes(swipes)
    setSwipeCount(0)
  }

  const stopTrackingTopUp = useCallback(() => {
    clearPendingTopUp(getLocalStorage())
    setTrackedTopUp(null)
  }, [])

  const applyTopUpOutcome = useCallback((outcome: TopUpVerifyOutcome) => {
    if (outcome.outcome === "credited" || outcome.outcome === "already_credited") {
      // Amounts come from the server (derived from the cUSD that moved), never
      // from the plan the client thought it bought.
      setCreditsRemaining(outcome.remaining)
      setCreditsMax(outcome.max)
      stopTrackingTopUp()
    } else if (outcome.outcome === "rejected") {
      // Final: nothing to recover for this hash.
      stopTrackingTopUp()
    }
    // pending / held / claimed_by_other keep the reference so a retry (or a
    // wallet switch to the payer's account) can still settle it.
    setTopUpStatus(topUpOutcomeToStatus(outcome))
  }, [setCreditsMax, setCreditsRemaining, stopTrackingTopUp])

  /** Re-runs on-chain verification for a saved payment reference. Never triggers a second payment. */
  const runTopUpVerification = useCallback(async (pending: PendingTopUp, userId: string) => {
    if (verifyingRef.current) return
    verifyingRef.current = true
    setTopUpStatus({ state: "verifying", txHash: pending.txHash })

    try {
      const outcome = await verifyTopUp({
        userId: userId as Id<"waitlistUsers">,
        chain: "celo",
        planId: pending.planId,
        txHash: pending.txHash,
      })
      applyTopUpOutcome(outcome)
    } catch (err) {
      console.error("Top-up verification failed:", err)
      setTopUpStatus(verificationErrorToStatus(pending.txHash, err))
    } finally {
      verifyingRef.current = false
    }
  }, [applyTopUpOutcome, verifyTopUp])

  const handleTopUpSuccess = (result: TopUpSuccessInput) => {
    setShowTopUp(false)

    if (!result.txHash) {
      setTopUpStatus(missingTxHashStatus())
      return
    }

    // Persist before anything async so a dropped connection or closed tab can
    // never lose the reference to a payment that already happened.
    const pending: PendingTopUp = {
      txHash: result.txHash,
      planId: result.planId,
      chain: "celo",
      userId: betaUserId,
      createdAt: Date.now(),
    }
    writePendingTopUp(getLocalStorage(), pending)
    autoVerifiedKeyRef.current = null
    setTrackedTopUp(pending)

    if (!betaUserId) {
      // Verification starts automatically once an account is active (effect below).
      setTopUpStatus({
        state: "failed",
        txHash: pending.txHash,
        retryable: true,
        final: false,
        message: "Payment reference saved. Connect the wallet you paid with so it can be verified and credited.",
      })
      return
    }

    setTopUpStatus({ state: "verifying", txHash: pending.txHash })
  }

  const retryTopUpVerification = useCallback(() => {
    if (!trackedTopUp) return
    if (!betaUserId) {
      setTopUpStatus({
        state: "failed",
        txHash: trackedTopUp.txHash,
        retryable: true,
        final: false,
        message: "Connect the wallet you paid with, then retry. The payment reference is saved.",
      })
      return
    }
    void runTopUpVerification(trackedTopUp, betaUserId)
  }, [betaUserId, runTopUpVerification, trackedTopUp])

  const dismissTopUpStatus = useCallback(() => {
    // Settled outcomes release the saved reference. Anything still recoverable
    // (pending, held, claimed by the payer's account, transient error) stays
    // tracked so a server-side settlement or a wallet switch can still land it.
    const settled =
      !topUpStatus ||
      topUpStatus.state === "credited" ||
      topUpStatus.state === "already-credited" ||
      (topUpStatus.state === "failed" && topUpStatus.final)
    if (settled) stopTrackingTopUp()
    setTopUpStatus(null)
  }, [stopTrackingTopUp, topUpStatus])

  // The three effects below react to Convex subscriptions and defer their
  // state transitions to a microtask (same convention as home-screen.tsx) so
  // they never set state synchronously inside the effect body.

  // Verify once per (hash, account): fresh payment, reload recovery, and the
  // moment the payer's wallet connects after a payer_mismatch.
  useEffect(() => {
    if (!trackedTopUp || !betaUserId) return
    if (trackedTopUpRecord === undefined) return // query still loading
    const key = `${trackedTopUp.txHash}:${betaUserId}`
    if (autoVerifiedKeyRef.current === key) return
    autoVerifiedKeyRef.current = key

    if (trackedTopUpRecord?.status === "credited") return // reactive effect below handles it
    queueMicrotask(() => {
      void runTopUpVerification(trackedTopUp, betaUserId)
    })
  }, [betaUserId, runTopUpVerification, trackedTopUp, trackedTopUpRecord])

  // Reactive path: the scheduler (or another tab) settled the tracked payment.
  useEffect(() => {
    if (!trackedTopUp || !trackedTopUpRecord) return
    if (trackedTopUpRecord.txHash !== trackedTopUp.txHash) return
    const record = trackedTopUpRecord

    queueMicrotask(() => {
      if (record.status === "credited") {
        setCreditsRemaining(record.credits.remaining)
        setCreditsMax(record.credits.max)
        setTopUpStatus(topUpRecordToStatus(record))
        stopTrackingTopUp()
        return
      }

      if (verifyingRef.current) return
      setTopUpStatus((prev) => {
        if (prev?.state === "verifying") return prev
        // Don't re-surface a dismissed "still confirming" toast on every
        // scheduler attempt; terminal transitions (rejected/held) do re-surface.
        if (!prev && record.status === "pending") return prev
        return topUpRecordToStatus(record)
      })
    })
  }, [setCreditsMax, setCreditsRemaining, stopTrackingTopUp, trackedTopUp, trackedTopUpRecord])

  // Cross-device / cleared-storage recovery: adopt the newest payment the
  // server is still trying to confirm for this account.
  useEffect(() => {
    if (trackedTopUp || !unresolvedTopUps?.length) return
    const newest = unresolvedTopUps.find((row) => row.status === "pending")
    if (!newest) return
    const pending: PendingTopUp = {
      txHash: newest.txHash,
      planId: newest.planId,
      chain: "celo",
      userId: betaUserId,
      createdAt: newest.ts,
    }
    queueMicrotask(() => {
      writePendingTopUp(getLocalStorage(), pending)
      setTrackedTopUp(pending)
    })
  }, [betaUserId, trackedTopUp, unresolvedTopUps])

  return {
    projects,
    userStats,
    userProfile,
    walletAddress,
    creditsRemaining,
    creditsMax,
    cart,
    showCart,
    setShowCart,
    showSuccess,
    setShowSuccess,
    showBadgeNotification,
    setShowBadgeNotification,
    currentBadge,
    showProfileQuickView,
    setShowProfileQuickView,
    showEditProfile,
    setShowEditProfile,
    showRegistrationForm,
    setShowRegistrationForm,
    showDonationSetup,
    setShowDonationSetup,
    showTopUp,
    setShowTopUp,
    topUpReason,
    setTopUpReason,
    topUpDefaultPlanId,
    showZeroSwipesGuardrail,
    setShowZeroSwipesGuardrail,
    categoriesFromCheckout,
    checkoutResult,
    recentDonations,
    showFeedback,
    setShowFeedback,
    topUpStatus,
    dismissTopUpStatus,
    retryTopUpVerification,
    betaUserId,
    handleCheckout,
    handleSaveProfile,
    handleDonationSetupSelect,
    handleTopUpSuccess,
  }
}
