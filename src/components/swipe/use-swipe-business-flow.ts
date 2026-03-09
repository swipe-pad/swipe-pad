import { useCallback, useRef, useState } from "react"

import { mapDecisionToFundingIntent, type SwipeDecision } from "@/components/swipe/engine"
import type { Project } from "@/lib/useConvexData"

type Mode = "discover" | "shared-entry"

type UserStatsState = {
  totalDonations: number
  categoriesSupported: Set<string>
  streak: number
  lastDonation: Date | null
}

type UserProfileState = {
  name?: string
  image?: string
  farcaster?: string
  lens?: string
  zora?: string
  twitter?: string
  nounsHeld?: number
  lilNounsHeld?: number
  projectsReported?: number
  poaps?: number
  paragraphs?: number
  ens?: string
  discord?: string
  totalSwipes: number
  totalDonated: number
}

type CartEntry = { project: unknown; amount: number; currency: string }

type SwipeSnapshot = {
  prevMode: Mode
  prevSelectedCategory: string
  prevSwipeCount: number
  prevCreditsRemaining: number
  prevCart: CartEntry[]
  prevUserStats: UserStatsState
  prevUserProfile: UserProfileState
}

function fallbackDecision(dir: "left" | "right"): SwipeDecision {
  if (dir === "right") {
    return {
      dir,
      strength: 1,
      velocityNorm: 0,
      score: 1,
      offsetX: 1,
      offsetY: 0,
      angleRad: 0,
      angleDeg: 0,
    }
  }

  return {
    dir,
    strength: 1,
    velocityNorm: 0,
    score: 1,
    offsetX: -1,
    offsetY: 0,
    angleRad: Math.PI,
    angleDeg: 180,
  }
}

export function useSwipeBusinessFlow(options: {
  mode: Mode
  setMode: (mode: Mode) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  swipeCount: number
  setSwipeCount: (next: number) => void
  creditsRemaining: number
  setCreditsRemaining: (next: number) => void
  cart: CartEntry[]
  setCart: (next: CartEntry[]) => void
  userStats: UserStatsState
  setUserStats: (next: UserStatsState | ((prev: UserStatsState) => UserStatsState)) => void
  userProfile: UserProfileState
  setUserProfile: (next: UserProfileState | ((prev: UserProfileState) => UserProfileState)) => void
  confirmSwipes: number
  donationCurrency: string
  effectiveDonationAmount: string
  betaUserId: string | null
  canSwipe: boolean
  freeMode: boolean
  currentProject: Project | null
  deckHistoryLength: number
  commit: (decision: SwipeDecision) => void
  undoDeck: () => void
  consumeCredit: () => Promise<number | null>
  recordSwipe: (input: { projectId: string; direction: "left" | "right"; amount?: number }) => void
  transitionToDiscover: () => void
}) {
  const {
    mode,
    setMode,
    selectedCategory,
    setSelectedCategory,
    swipeCount,
    setSwipeCount,
    creditsRemaining,
    setCreditsRemaining,
    cart,
    setCart,
    userStats,
    setUserStats,
    userProfile,
    setUserProfile,
    confirmSwipes,
    donationCurrency,
    effectiveDonationAmount,
    betaUserId,
    canSwipe,
    freeMode,
    currentProject,
    deckHistoryLength,
    commit,
    undoDeck,
    consumeCredit,
    recordSwipe,
    transitionToDiscover,
  } = options

  const [swipeHistory, setSwipeHistory] = useState<SwipeSnapshot[]>([])
  const [isAdvancing, setIsAdvancing] = useState(false)
  const isRestoringSnapshotRef = useRef(false)

  const buildSnapshot = useCallback((): SwipeSnapshot => ({
    prevMode: mode,
    prevSelectedCategory: selectedCategory,
    prevSwipeCount: swipeCount,
    prevCreditsRemaining: creditsRemaining,
    prevCart: [...cart],
    prevUserStats: {
      ...userStats,
      categoriesSupported: new Set(userStats.categoriesSupported),
    },
    prevUserProfile: {
      ...userProfile,
      totalSwipes: userProfile.totalSwipes,
      totalDonated: userProfile.totalDonated,
    },
  }), [cart, creditsRemaining, mode, selectedCategory, swipeCount, userProfile, userStats])

  const handleSwipeRight = useCallback(async (decision?: SwipeDecision, options?: { skipDeckCommit?: boolean }) => {
    if (!canSwipe || !currentProject || isAdvancing) return
    if (!freeMode && !betaUserId) return

    setIsAdvancing(true)
    const snapshot = buildSnapshot()

    try {
      if (freeMode) {
        if (mode === "shared-entry") {
          setMode("discover")
          setSelectedCategory("See All")
          transitionToDiscover()
        }

        if (!options?.skipDeckCommit) {
          commit(decision ?? fallbackDecision("right"))
        }
        setSwipeHistory((prev) => [...prev, snapshot])
        return
      }

      const remaining = await consumeCredit()
      if (remaining === null) {
        if (options?.skipDeckCommit) {
          undoDeck()
        }
        setIsAdvancing(false)
        return
      }

      setCreditsRemaining(remaining)

      setUserStats((prev) => {
        const categoriesSupported = new Set(prev.categoriesSupported)
        categoriesSupported.add(currentProject.category)
        return {
          totalDonations: prev.totalDonations + 1,
          categoriesSupported,
          streak: prev.lastDonation ? prev.streak + 1 : 1,
          lastDonation: new Date(),
        }
      })

      const amountNum = parseFloat(effectiveDonationAmount.split(" ")[0])
      setUserProfile((prev) => ({
        ...prev,
        totalSwipes: prev.totalSwipes + 1,
        totalDonated: prev.totalDonated + amountNum,
      }))

      setCart([...cart, { project: currentProject, amount: amountNum, currency: donationCurrency }])

      if (decision) {
        const intent = mapDecisionToFundingIntent(decision)
        console.log("[SwipeIntent] right", {
          action: intent.action,
          conviction: intent.conviction,
          multiplier: intent.quadraticMultiplier,
          projectId: currentProject.projectId,
        })
      }

      recordSwipe({
        projectId: currentProject.projectId,
        direction: "right",
        amount: amountNum,
      })

      const newCount = swipeCount + 1
      if (newCount >= confirmSwipes) {
        setSwipeCount(0)
      } else {
        setSwipeCount(newCount)
      }

      if (mode === "shared-entry") {
        setMode("discover")
        setSelectedCategory("See All")
        transitionToDiscover()
      }

      if (!options?.skipDeckCommit) {
        commit(decision ?? fallbackDecision("right"))
      }
      setSwipeHistory((prev) => [...prev, snapshot])
    } catch (error) {
      console.error("Failed to process right swipe:", error)
      if (options?.skipDeckCommit) {
        undoDeck()
      }
    } finally {
      setIsAdvancing(false)
    }
  }, [
    betaUserId,
    buildSnapshot,
    canSwipe,
    cart,
    commit,
    confirmSwipes,
    consumeCredit,
    currentProject,
    donationCurrency,
    effectiveDonationAmount,
    freeMode,
    isAdvancing,
    mode,
    recordSwipe,
    setCart,
    setCreditsRemaining,
    setMode,
    setSelectedCategory,
    setSwipeCount,
    setUserProfile,
    setUserStats,
    swipeCount,
    transitionToDiscover,
    undoDeck,
  ])

  const handleSwipeLeft = useCallback(async (decision?: SwipeDecision, options?: { skipDeckCommit?: boolean }) => {
    if (!currentProject || isAdvancing) return

    setIsAdvancing(true)
    const snapshot = buildSnapshot()

    try {
      if (!freeMode) {
        setUserProfile((prev) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))
      }

      if (!freeMode && betaUserId) {
        if (decision) {
          const intent = mapDecisionToFundingIntent(decision)
          console.log("[SwipeIntent] left", {
            action: intent.action,
            conviction: intent.conviction,
            multiplier: intent.quadraticMultiplier,
            projectId: currentProject.projectId,
          })
        }

        recordSwipe({
          projectId: currentProject.projectId,
          direction: "left",
        })
      }

      if (mode === "shared-entry") {
        setMode("discover")
        setSelectedCategory("See All")
        transitionToDiscover()
      }

      if (!options?.skipDeckCommit) {
        commit(decision ?? fallbackDecision("left"))
      }
      setSwipeHistory((prev) => [...prev, snapshot])
    } catch (error) {
      console.error("Failed to process left swipe:", error)
      if (options?.skipDeckCommit) {
        undoDeck()
      }
    } finally {
      setIsAdvancing(false)
    }
  }, [
    betaUserId,
    buildSnapshot,
    commit,
    currentProject,
    freeMode,
    isAdvancing,
    mode,
    recordSwipe,
    setMode,
    setSelectedCategory,
    setUserProfile,
    transitionToDiscover,
    undoDeck,
  ])

  const handleUndo = useCallback(() => {
    setSwipeHistory((prev) => {
      if (prev.length === 0 || deckHistoryLength === 0) return prev

      const next = [...prev]
      const last = next.pop()
      if (!last) return prev

      isRestoringSnapshotRef.current = true
      setMode(last.prevMode)
      setSelectedCategory(last.prevSelectedCategory)
      setSwipeCount(last.prevSwipeCount)
      setCreditsRemaining(last.prevCreditsRemaining)
      setCart(last.prevCart)
      setUserStats(last.prevUserStats)
      setUserProfile(last.prevUserProfile)
      undoDeck()

      return next
    })
  }, [
    deckHistoryLength,
    setCart,
    setCreditsRemaining,
    setMode,
    setSelectedCategory,
    setSwipeCount,
    setUserProfile,
    setUserStats,
    undoDeck,
  ])

  const clearSwipeHistory = useCallback(() => {
    setSwipeHistory([])
  }, [])

  const canUndo = swipeHistory.length > 0 && deckHistoryLength > 0

  return {
    isAdvancing,
    canUndo,
    isRestoringSnapshotRef,
    clearSwipeHistory,
    handleSwipeRight,
    handleSwipeLeft,
    handleUndo,
  }
}
