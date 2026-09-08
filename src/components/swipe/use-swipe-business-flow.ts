import { useCallback, useEffect, useRef, useState } from "react"

import { mapDecisionToFundingIntent, type SwipeDecision } from "@/components/swipe/engine"
import {
  cartAfterUndo,
  creditsAfterUndo,
  profileAfterUndo,
  reconcileRightSwipe,
  statsAfterUndo,
  type SwipeUndoRecord,
} from "@/components/swipe/right-swipe-reconciliation"
import { subscribeCheckoutSettled } from "@/lib/checkout-event"
import { haptic } from "@/lib/haptics"
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

/**
 * One undoable swipe. Navigation state (mode, category, confirm counter) is
 * only ever moved by swipes, so its previous value is kept verbatim; every
 * shared consequence (credits, cart, stats, profile) is stored as the delta
 * this swipe produced and reversed against the *current* state on undo.
 */
type SwipeHistoryEntry = SwipeUndoRecord<CartEntry> & {
  prevMode: Mode
  prevSelectedCategory: string
  prevSwipeCount: number
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
  setCreditsRemaining: (next: number | ((prev: number) => number)) => void
  // Cart, stats and profile are only ever written through functional
  // updaters (append on commit, subtract on undo), so their current values
  // are not needed here — and a captured copy would just be a stale snapshot.
  setCart: (next: CartEntry[] | ((prev: CartEntry[]) => CartEntry[])) => void
  setUserStats: (next: UserStatsState | ((prev: UserStatsState) => UserStatsState)) => void
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
    setCart,
    setUserStats,
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

  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryEntry[]>([])
  const [isAdvancing, setIsAdvancing] = useState(false)
  const isRestoringSnapshotRef = useRef(false)

  const navigationBefore = useCallback(() => ({
    prevMode: mode,
    prevSelectedCategory: selectedCategory,
    prevSwipeCount: swipeCount,
  }), [mode, selectedCategory, swipeCount])

  const applyUndo = useCallback((entry: SwipeHistoryEntry) => {
    isRestoringSnapshotRef.current = true
    setMode(entry.prevMode)
    setSelectedCategory(entry.prevSelectedCategory)
    setSwipeCount(entry.prevSwipeCount)
    // Functional updates against the live state: the cart may have been
    // checked out or extended since this swipe, and only this swipe's own
    // delta is taken back.
    if (entry.creditsSpent !== 0) setCreditsRemaining((prev) => creditsAfterUndo(prev, entry))
    if (entry.cartEntry) setCart((prev) => cartAfterUndo(prev, entry))
    if (entry.stats) setUserStats((prev) => statsAfterUndo(prev, entry))
    if (entry.profile) setUserProfile((prev) => profileAfterUndo(prev, entry))
  }, [setCart, setCreditsRemaining, setMode, setSelectedCategory, setSwipeCount, setUserProfile, setUserStats])

  const handleSwipeRight = useCallback(async (decision?: SwipeDecision, options?: { skipDeckCommit?: boolean }) => {
    if (!canSwipe || !currentProject || isAdvancing) return
    if (!freeMode && !betaUserId) return

    setIsAdvancing(true)
    const navigation = navigationBefore()

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
        setSwipeHistory((prev) => [
          ...prev,
          { ...navigation, creditsSpent: 0, cartEntry: null, stats: null, profile: null },
        ])
        return
      }

      // Optimistic *visuals* only: the card is already gone, so the counter
      // ticks down and the deck advances right away. Everything with
      // consequences — the cart item, stats, the swipe event — waits for the
      // server to accept the credit (see reconcileRightSwipe). A late
      // rejection then only undoes those optimistic deltas, never a full
      // snapshot that may already be stale (e.g. the cart was checked out
      // while the request was in flight). `isAdvancing` stays true until the
      // server answers, so swipes are serialized and `creditsRemaining` is the
      // last acknowledged value.
      await reconcileRightSwipe({
        creditsBeforeSwipe: creditsRemaining,
        consumeCredit,
        onOptimistic: (creditsShown) => {
          setCreditsRemaining(creditsShown)
          haptic("tap")
          if (!options?.skipDeckCommit) {
            commit(decision ?? fallbackDecision("right"))
          }
        },
        onRollback: (creditsRestored) => {
          setCreditsRemaining(creditsRestored)
          undoDeck()
          haptic("block")
        },
        onCommitted: (remaining) => {
          setCreditsRemaining(remaining)

          // Capture what this swipe changes so undo can subtract exactly that.
          let stats: SwipeHistoryEntry["stats"] = null
          setUserStats((prev) => {
            const categoriesSupported = new Set(prev.categoriesSupported)
            const categoryAdded = categoriesSupported.has(currentProject.category) ? null : currentProject.category
            categoriesSupported.add(currentProject.category)
            stats = { totalDonations: 1, categoryAdded, prevStreak: prev.streak, prevLastDonation: prev.lastDonation }
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

          // Functional update: the cart may have changed while we awaited the server.
          const cartEntry: CartEntry = { project: currentProject, amount: amountNum, currency: donationCurrency }
          setCart((prev) => [...prev, cartEntry])

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

          setSwipeHistory((prev) => [
            ...prev,
            {
              ...navigation,
              creditsSpent: 1,
              cartEntry,
              stats,
              profile: { totalSwipes: 1, totalDonated: amountNum },
            },
          ])
        },
      })
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
    navigationBefore,
    canSwipe,
    commit,
    confirmSwipes,
    consumeCredit,
    creditsRemaining,
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
    const navigation = navigationBefore()
    let profile: SwipeHistoryEntry["profile"] = null

    try {
      if (!freeMode) {
        setUserProfile((prev) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))
        profile = { totalSwipes: 1, totalDonated: 0 }
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
      setSwipeHistory((prev) => [...prev, { ...navigation, creditsSpent: 0, cartEntry: null, stats: null, profile }])
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
    navigationBefore,
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

      applyUndo(last)
      undoDeck()
      haptic("undo")

      return next
    })
  }, [applyUndo, deckHistoryLength, undoDeck])

  const clearSwipeHistory = useCallback(() => {
    setSwipeHistory([])
  }, [])

  // Checkout settles every cart entry. Whatever was undoable before is now a
  // donation, so the history is dropped instead of ever being replayed.
  useEffect(() => subscribeCheckoutSettled(clearSwipeHistory), [clearSwipeHistory])

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
