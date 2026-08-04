"use client"

import { useEffect, useMemo, useState } from "react"
import { useAction } from "convex/react"
import { useShallow } from "zustand/react/shallow"

import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { useApp } from "@/context/AppContext"
import { useProjects } from "@/lib/useConvexData"
import { TOP_UP_DIALOG_EVENT, type TopUpDialogDetail } from "@/lib/top-up-dialog"
import type { CheckoutResult } from "@/components/cart"
import type { ConfirmSwipes, DonationAmount, StableCoin } from "@/components/amount-selector"
import type { EditProfileFormData } from "@/components/edit-profile"

export type TopUpStatus =
  | { state: "verifying" }
  | { state: "credited"; swipes: number }
  | { state: "failed"; message: string }

type CartCategoryItem = {
  project?: {
    category?: string
  }
}

export function useAppOverlays() {
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
    setCheckoutResult(result)
    setCheckoutSnapshot(cart as CartCategoryItem[])
    setShowCart(false)
    setShowSuccess(true)
    setCart([])
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

  const handleTopUpSuccess = async (result: { planId: string; swipesGranted: number; txHash?: string }) => {
    setShowTopUp(false)

    if (!result.txHash || !betaUserId) {
      setTopUpStatus({
        state: "failed",
        message: "Payment sent, but we couldn't verify it automatically yet. Your swipes will be credited shortly.",
      })
      return
    }

    setTopUpStatus({ state: "verifying" })

    try {
      const res = await verifyTopUp({
        userId: betaUserId as Id<"waitlistUsers">,
        chain: "celo",
        planId: result.planId,
        txHash: result.txHash,
      })
      setCreditsRemaining(res.remaining)
      setCreditsMax(res.max)
      setTopUpStatus({ state: "credited", swipes: result.swipesGranted })
    } catch (err) {
      console.error("Top-up verification failed:", err)
      setTopUpStatus({
        state: "failed",
        message: "Payment sent, but verification failed. No swipes were lost — retry from your recharge dialog or contact us.",
      })
    }
  }

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
    setTopUpStatus,
    betaUserId,
    handleCheckout,
    handleSaveProfile,
    handleDonationSetupSelect,
    handleTopUpSuccess,
  }
}
