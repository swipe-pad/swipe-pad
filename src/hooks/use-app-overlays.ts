"use client"

import { useMemo, useState } from "react"
import { useShallow } from "zustand/react/shallow"

import { useApp } from "@/context/AppContext"
import { useProjects } from "@/lib/useConvexData"
import type { ConfirmSwipes, DonationAmount, StableCoin } from "@/components/amount-selector"

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
  })))

  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showBadgeNotification, setShowBadgeNotification] = useState(false)
  const [currentBadge] = useState("")
  const [showProfileQuickView, setShowProfileQuickView] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [showDonationSetup, setShowDonationSetup] = useState(false)
  const [showZeroSwipesGuardrail, setShowZeroSwipesGuardrail] = useState(false)
  const [checkoutSnapshot, setCheckoutSnapshot] = useState<CartCategoryItem[]>([])

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

  const handleCheckout = () => {
    setCheckoutSnapshot(cart as CartCategoryItem[])
    setShowCart(false)
    setShowSuccess(true)
    setCart([])
  }

  const handleSaveProfile = (data: Record<string, unknown>) => {
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

  return {
    projects,
    userStats,
    userProfile,
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
    showZeroSwipesGuardrail,
    setShowZeroSwipesGuardrail,
    categoriesFromCheckout,
    recentDonations,
    handleCheckout,
    handleSaveProfile,
    handleDonationSetupSelect,
  }
}
