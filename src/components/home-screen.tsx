"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { RotateCcw, ThumbsUp, X } from "lucide-react"

import { useApp } from "@/context/AppContext"
import { OzkCard } from "@/components/cards/OzkCard"
import { ProjectCard } from "@/components/project-card"
import { useSwipeDeck, type SwipeItem } from "@/components/swipe/use-swipe-deck"
import { useSwipeBusinessFlow } from "@/components/swipe/use-swipe-business-flow"
import { SwipeStack, type SwipeStackHandle } from "@/components/swipe/SwipeStack"
import { getStoredCardDesign, setStoredCardDesign } from "@/lib/card-design-preference"
import { getDevFreeModeEnabled } from "@/lib/dev-free-mode"
import type { CardDesignId } from "@/lib/card-designs"
import type { Project } from "@/lib/useConvexData"
import { getProjectImageSrc, getTopLevelCategory, TOP_LEVEL_CATEGORIES, type FeedCategory } from "@/lib/project-taxonomy"
import type { ServerProject } from "@/lib/convex-server"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

type TopCategory = FeedCategory
const INITIAL_WARMUP_TIMEOUT_MS = 900
const FEED_REQUEST_TIMEOUT_MS = 9000
const STACK_ROTATIONS_ENABLED = false

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    window.clearTimeout(timeout)
  }
}

function toPreloadUrl(project: Project | null): string | null {
  if (!project) {
    return null
  }

  return getProjectImageSrc(project.imageUrl, { category: project.category, source: project.source })
}

type HomeScreenProps = {
  initialMode?: "discover" | "shared-entry"
  initialProject?: ServerProject | null
  initialSessionSeed?: string
}

type FeedRequestOptions = {
  exclude?: string
  category?: TopCategory
}

export function HomeScreen({
  initialMode = "discover",
  initialProject = null,
  initialSessionSeed,
}: HomeScreenProps = {}) {
  const router = useRouter()
  const {
    selectedCategory,
    setSelectedCategory,
    donationAmount,
    donationCurrency,
    confirmSwipes,
    swipeCount,
    setSwipeCount,
    userStats,
    setUserStats,
    userProfile,
    setUserProfile,
    cart,
    setCart,
    betaUserId,
    betaStatus,
    creditsRemaining,
    setCreditsRemaining,
  } = useApp(
    useShallow((state) => ({
      selectedCategory: state.selectedCategory,
      setSelectedCategory: state.setSelectedCategory,
      donationAmount: state.donationAmount,
      donationCurrency: state.donationCurrency,
      confirmSwipes: state.confirmSwipes,
      swipeCount: state.swipeCount,
      setSwipeCount: state.setSwipeCount,
      userStats: state.userStats,
      setUserStats: state.setUserStats,
      userProfile: state.userProfile,
      setUserProfile: state.setUserProfile,
      cart: state.cart,
      setCart: state.setCart,
      betaUserId: state.betaUserId,
      betaStatus: state.betaStatus,
      creditsRemaining: state.creditsRemaining,
      setCreditsRemaining: state.setCreditsRemaining,
    })),
  )

  const [mode, setMode] = useState<"discover" | "shared-entry">(initialMode)
  const [isFeedVisible, setIsFeedVisible] = useState(Boolean(initialProject))
  const [showCategoryToast, setShowCategoryToast] = useState(true)
  const [activeCardDesign, setActiveCardDesign] = useState<CardDesignId>("OZK_CARD_V1_NEON")
  const [freeModeEnabled, setFreeModeEnabled] = useState(false)

  useEffect(() => {
    const next = getStoredCardDesign()
    if (next) {
      // Migrate users with old card designs to OZK by default
      if (next === "SP_CARD_V2_STACK" || next === "SP_CARD_V2_INLINE") {
        setStoredCardDesign("OZK_CARD_V1_NEON")
        setActiveCardDesign("OZK_CARD_V1_NEON")
      } else {
        setActiveCardDesign(next)
      }
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "swipepad.activeCardDesign") return
      const value = getStoredCardDesign()
      if (value) setActiveCardDesign(value)
    }

    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  useEffect(() => {
    const syncFreeMode = () => {
      setFreeModeEnabled(getDevFreeModeEnabled())
    }

    syncFreeMode()

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "swipepad.devFreeMode") return
      syncFreeMode()
    }
    const onCustom = () => syncFreeMode()

    window.addEventListener("storage", onStorage)
    window.addEventListener("swipepad:free-mode-change", onCustom)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("swipepad:free-mode-change", onCustom)
    }
  }, [])

  const canSwipe = freeModeEnabled || ((betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0)
  const effectiveDonationAmount = donationAmount ?? "0.01¢"
  const totalSwipes = userProfile.totalSwipes ?? 0
  const level = Math.max(1, Math.floor(totalSwipes / 25) + 1)
  const xpInLevel = totalSwipes % 500
  const xpProgress = (xpInLevel / 500) * 100

  const categoryTabs = TOP_LEVEL_CATEGORIES
  const activeCategory = categoryTabs.includes(selectedCategory as TopCategory)
    ? (selectedCategory as TopCategory)
    : "See All"

  const sessionSeedRef = useRef(
    initialSessionSeed ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`),
  )
  const requestCounterRef = useRef(0)
  const preloadedUrlsRef = useRef<Set<string>>(new Set())
  const preloadingUrlsRef = useRef<Map<string, Promise<void>>>(new Map())
  const swipeAbsoluteIndexRef = useRef(0)
  const swipeIdRef = useRef(0)
  const hasHydratedCategoryRef = useRef(false)
  const deckProjectKeysRef = useRef<Set<string>>(new Set())

  const consumeCredits = useMutation(api.waitlist.consumeCredits)
  const recordSwipe = useMutation(api.waitlist.recordSwipe)

  const queueImagePreload = (url: string): Promise<void> => {
    if (preloadedUrlsRef.current.has(url)) return Promise.resolve()

    const inFlight = preloadingUrlsRef.current.get(url)
    if (inFlight) return inFlight

    const task = new Promise<void>((resolve) => {
      const image = new window.Image()
      image.decoding = "async"

      const finalize = () => {
        preloadedUrlsRef.current.add(url)
        preloadingUrlsRef.current.delete(url)
        resolve()
      }

      image.onload = finalize
      image.onerror = finalize
      image.src = url
    })

    preloadingUrlsRef.current.set(url, task)
    return task
  }

  const matchesCategory = (project: Project, category: TopCategory) => {
    if (category === "See All") return true
    return getTopLevelCategory({ category: project.category, source: project.source }) === category
  }

  const fetchFeedProject = useCallback(async (options: FeedRequestOptions = {}): Promise<Project | null> => {
    if (typeof window === "undefined") return null

    const category = options.category ?? activeCategory
    let exclude = options.exclude

    for (let attempt = 0; attempt < 6; attempt += 1) {
      requestCounterRef.current += 1
      const requestSeed = `${sessionSeedRef.current}:${requestCounterRef.current}:${attempt}`
      const url = new URL("/api/feed", window.location.origin)

      if (exclude) {
        url.searchParams.set("exclude", exclude)
      }
      url.searchParams.set("seed", requestSeed)
      url.searchParams.set("category", category)

      try {
        const response = await fetchWithTimeout(url.toString(), { cache: "no-store" }, FEED_REQUEST_TIMEOUT_MS)
        if (!response.ok) {
          continue
        }

        const data = (await response.json()) as { project?: Project }
        const project = data.project
        if (!project) {
          continue
        }

        if (!matchesCategory(project, category)) {
          exclude = project.projectId || project.routeId
          continue
        }

        return project
      } catch (error) {
        console.warn("[feed] request failed", { attempt, error })
      }
    }

    return null
  }, [activeCategory])

  const toSwipeItem = useCallback((project: Project): SwipeItem<Project> => {
    const absoluteIndex = swipeAbsoluteIndexRef.current
    swipeAbsoluteIndexRef.current += 1
    swipeIdRef.current += 1

    return {
      id: `${project.projectId || project.routeId || "project"}-${swipeIdRef.current}`,
      data: project,
      absoluteIndex,
    }
  }, [])

  const getProjectKey = useCallback((project: Project) => {
    return project.projectId || project.routeId || project.id
  }, [])

  const initialDeckItems = useMemo(() => {
    if (!initialProject) return []
    return [toSwipeItem(initialProject as Project)]
  }, [initialProject, toSwipeItem])

  const refillDeck = useCallback(async (need: number) => {
    if (mode !== "discover") return []

    const newItems: SwipeItem<Project>[] = []
    const seenKeys = new Set(deckProjectKeysRef.current)
    let exclude: string | undefined
    let attempts = 0
    const maxAttempts = Math.max(need * 4, 8)

    while (newItems.length < need && attempts < maxAttempts) {
      attempts += 1
      const project = await fetchFeedProject({
        exclude,
        category: activeCategory,
      })

      if (!project) break

      exclude = project.projectId || project.routeId

      const projectKey = getProjectKey(project)
      if (seenKeys.has(projectKey)) {
        continue
      }

      seenKeys.add(projectKey)
      newItems.push(toSwipeItem(project))
    }

    return newItems
  }, [activeCategory, fetchFeedProject, getProjectKey, mode, toSwipeItem])

  const { busyRef, items, visibleItems, history: deckHistory, resetDeck, commit, undo } = useSwipeDeck<Project>({
    config: { visible: 4 },
    initial: initialDeckItems,
    refill: refillDeck,
  })

  const currentProject = visibleItems[0]?.data ?? null
  const nextProject = visibleItems[1]?.data ?? null

  const consumeCredit = useCallback(async () => {
    if (!betaUserId) return null

    try {
      const creditsResult = await consumeCredits({
        userId: betaUserId as Id<"waitlistUsers">,
        chain: "celo",
        amount: 1,
      })

      return creditsResult.remaining
    } catch (error) {
      console.error("Failed to consume credits:", error)
      return null
    }
  }, [betaUserId, consumeCredits])

  const recordSwipeEvent = useCallback((input: { projectId: string; direction: "left" | "right"; amount?: number }) => {
    if (!betaUserId) return

    recordSwipe({
      userId: betaUserId as Id<"waitlistUsers">,
      projectId: input.projectId,
      direction: input.direction,
      ...(typeof input.amount === "number" ? { amount: input.amount } : {}),
    }).catch((error) => console.error("Failed to record swipe:", error))
  }, [betaUserId, recordSwipe])

  const transitionToDiscover = useCallback(() => {
    router.replace("/")
  }, [router])

  const {
    isAdvancing,
    canUndo,
    isRestoringSnapshotRef,
    clearSwipeHistory,
    handleSwipeRight,
    handleSwipeLeft,
    handleUndo,
  } = useSwipeBusinessFlow({
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
    freeMode: freeModeEnabled,
    currentProject,
    deckHistoryLength: deckHistory.length,
    commit,
    undoDeck: undo,
    consumeCredit,
    recordSwipe: recordSwipeEvent,
    transitionToDiscover,
  })

  const stackRef = useRef<SwipeStackHandle>(null)
  const deckY = useMotionValue(0)
  const deckX = useTransform(deckY, [-400, 0, 400], [40, 0, 40])
  const deckRotate = useTransform(deckY, [-400, 0, 400], [8, 0, -8])
  const deckOpacity = useMotionValue(1)

  const buttonSwipe = useCallback((dir: "left" | "right") => {
    if (isAdvancing) return
    if (dir === "right" && !canSwipe) return
    stackRef.current?.swipe(dir)
  }, [canSwipe, isAdvancing])

  useEffect(() => {
    setShowCategoryToast(true)
    const timer = window.setTimeout(() => setShowCategoryToast(false), 1200)
    return () => window.clearTimeout(timer)
  }, [activeCategory])

  const switchCategory = useCallback((dir: "up" | "down") => {
    if (busyRef.current || isAdvancing) return
    busyRef.current = true

    const currentIndex = TOP_LEVEL_CATEGORIES.indexOf(activeCategory)
    const sign = dir === "up" ? -1 : 1
    const distance = typeof window !== "undefined" ? window.innerHeight * 0.72 : 640
    const nextIndex = (currentIndex + (dir === "up" ? 1 : -1) + TOP_LEVEL_CATEGORIES.length) % TOP_LEVEL_CATEGORIES.length
    const nextCategory = TOP_LEVEL_CATEGORIES[nextIndex] ?? "See All"

    animate(deckY, sign * distance, { duration: 0.26, ease: "easeIn" })
    animate(deckOpacity, 0, {
      duration: 0.18,
      ease: "easeOut",
      onComplete: () => {
        clearSwipeHistory()
        setSelectedCategory(nextCategory)

        deckY.set(-sign * distance)

        animate(deckY, 0, { type: "spring", stiffness: 420, damping: 28, mass: 0.82 })
        animate(deckOpacity, 1, {
          duration: 0.28,
          ease: "easeOut",
          onComplete: () => {
            busyRef.current = false
          },
        })
      },
    })
  }, [activeCategory, busyRef, clearSwipeHistory, deckOpacity, deckY, isAdvancing, setSelectedCategory])

  const onDragDeckEnd = useCallback((_: unknown, info: PanInfo) => {
    const { y: offsetY } = info.offset
    const { y: velocityY } = info.velocity

    if (offsetY < -80 || velocityY < -400) {
      switchCategory("up")
      return
    }

    if (offsetY > 80 || velocityY > 400) {
      switchCategory("down")
      return
    }

    animate(deckY, 0, { type: "spring", stiffness: 500, damping: 30 })
  }, [deckY, switchCategory])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null
      const blocked =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.tagName === "SELECT" ||
        active?.isContentEditable

      if (blocked) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        buttonSwipe("left")
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        buttonSwipe("right")
      } else if (event.key === "ArrowUp") {
        event.preventDefault()
        switchCategory("up")
      } else if (event.key === "ArrowDown") {
        event.preventDefault()
        switchCategory("down")
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (canUndo && !isAdvancing) {
          handleUndo()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [buttonSwipe, canUndo, handleUndo, isAdvancing, switchCategory])

  useEffect(() => {
    const keys = items.map((item) => getProjectKey(item.data))
    deckProjectKeysRef.current = new Set(keys)
  }, [getProjectKey, items])

  useEffect(() => {
    if (mode !== "discover") return
    if (currentProject) return

    let cancelled = false
    const loadInitial = async () => {
      const project = await fetchFeedProject({ category: activeCategory })
      if (!cancelled && project) {
        resetDeck([toSwipeItem(project)])
      }
    }

    void loadInitial()

    return () => {
      cancelled = true
    }
  }, [activeCategory, currentProject, fetchFeedProject, mode, resetDeck, toSwipeItem])

  useEffect(() => {
    if (mode !== "discover") return
    if (isRestoringSnapshotRef.current) {
      isRestoringSnapshotRef.current = false
      return
    }

    if (!hasHydratedCategoryRef.current) {
      hasHydratedCategoryRef.current = true
      return
    }

    let cancelled = false
    const reloadForCategory = async () => {
      const project = await fetchFeedProject({ category: activeCategory })
      if (!cancelled) {
        resetDeck(project ? [toSwipeItem(project)] : [])
      }
    }

    void reloadForCategory()

    return () => {
      cancelled = true
    }
  }, [activeCategory, fetchFeedProject, mode, resetDeck, toSwipeItem])

  useEffect(() => {
    const currentUrl = toPreloadUrl(currentProject)
    const nextUrl = toPreloadUrl(nextProject)

    if (!currentUrl && !nextUrl) {
      setIsFeedVisible(Boolean(currentProject))
      return
    }

    if (currentUrl) {
      void Promise.race([queueImagePreload(currentUrl), wait(INITIAL_WARMUP_TIMEOUT_MS)])
    }
    if (nextUrl) {
      void queueImagePreload(nextUrl)
    }

    setIsFeedVisible(true)
    return undefined
  }, [currentProject, nextProject])

  const handleCategoryChange = (category: string) => {
    if (mode === "shared-entry") return
    clearSwipeHistory()
    setSelectedCategory(category)
  }

  const shouldShowWarmup = !currentProject

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 pt-1 pb-3">
      <div className="mb-2">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {mode === "discover"
            ? categoryTabs.map((category) => {
                const active = activeCategory === category

                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`
                                  shrink-0 rounded-full border px-3.5 py-1.5
                                  text-xs font-semibold transition-colors
                                  sm:px-4 sm:py-2 sm:text-sm
                                  ${
                                    active
                                      ? `
                                          border-primary bg-primary
                                          text-primary-foreground
                                        `
                                      : `
                                          border-surface-border bg-[#171d2b]
                                          text-gray-300
                                          hover:bg-[#20293b]
                                        `
                                  }
                                `}
                  >
                    {category}
                  </button>
                )
              })
            : null}
        </div>
      </div>

      <div className="pointer-events-none absolute top-9 left-0 z-50 flex w-full justify-center sm:top-12">
        <AnimatePresence>
          {showCategoryToast ? (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 25 }}
              className="rounded-full border border-slate-200 bg-white/85 px-5 py-1.5 shadow-lg backdrop-blur-xl sm:px-7 sm:py-2.5"
            >
              <span className="text-xs font-black tracking-widest text-slate-800 uppercase sm:text-sm">{activeCategory}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-wide text-gray-400">YOUR LEVEL</p>
          <p className="font-display text-2xl leading-none tracking-wide text-white sm:text-3xl">LVL {level}</p>
        </div>

        <div className="w-36 pb-1 sm:w-40">
          <p className="mb-1 text-right text-[10px] text-gray-300 sm:text-xs">{xpInLevel} / 500 XP</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#203150]">
            <div
              className="h-full bg-[#395079] transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center pt-1 pb-16 sm:pb-20">
        <div className="aspect-[3/4] h-full sm:aspect-5/8 sm:h-[min(100%,740px)] lg:h-[min(100%,920px)]">
          {shouldShowWarmup ? (
            <div className="relative size-full overflow-hidden rounded-[28px] border border-surface-border bg-[#101a2f]">
              <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_20%,rgba(74,101,146,0.22),transparent_50%)]" />
              <div className="absolute -left-1/3 top-0 h-full w-1/2 -skew-x-12 animate-[boost-sheen_3.2s_ease-in-out_infinite] bg-white/8 blur-xl" />
              <div className="absolute inset-x-5 top-5 h-8 rounded-xl bg-white/10" />
              <div className="absolute inset-x-5 bottom-5 space-y-2">
                <div className="h-5 w-3/5 rounded-md bg-white/14" />
                <div className="h-4 w-full rounded-md bg-white/10" />
                <div className="h-4 w-4/5 rounded-md bg-white/8" />
              </div>
            </div>
          ) : currentProject ? (
            <motion.div
              style={{ y: deckY, x: deckX, rotate: deckRotate, opacity: deckOpacity, willChange: "transform, opacity" }}
              drag="y"
              dragDirectionLock
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.4}
              onDragEnd={onDragDeckEnd}
              className={`relative size-full transition-opacity duration-300 ${isFeedVisible ? "opacity-100" : "opacity-0"}`}
            >
              <SwipeStack
                ref={stackRef}
                items={visibleItems}
                className="relative size-full"
                busyRef={busyRef}
                disabled={isAdvancing}
                rotationsEnabled={STACK_ROTATIONS_ENABLED}
                visible={4}
                visualDepth={3}
                stackRotations={[0, -2, 2]}
                stackYs={[0, 0, 0]}
                canSwipeDirection={(dir) => (dir === "right" ? canSwipe : dir === "left")}
                onCommit={(decision) => {
                  if (decision.dir === "left") {
                    commit(decision)
                    void handleSwipeLeft(decision, { skipDeckCommit: true })
                    return
                  }
                  if (decision.dir === "right") {
                    if (!canSwipe) return
                    commit(decision)
                    void handleSwipeRight(decision, { skipDeckCommit: true })
                  }
                }}
                renderCard={(item, isTop) => {
                  if (activeCardDesign === "OZK_CARD_V1_NEON") {
                    return (
                      <OzkCard
                        project={item.data}
                        onBoost={() => console.log("boost")}
                        onSwipeLeft={() => {
                          if (!isTop) return
                          buttonSwipe("left")
                        }}
                        onSwipeRight={() => {
                          if (!isTop) return
                          buttonSwipe("right")
                        }}
                        onUndo={() => {
                          if (!isTop) return
                          handleUndo()
                        }}
                      />
                    )
                  }

                  return (
                    <ProjectCard
                      className="size-full"
                      project={item.data}
                      projectPathId={item.data.routeId}
                      isLoading={false}
                      showImageLoader={false}
                      viewMode="swipe"
                      swipeControlMode={activeCardDesign === "SP_CARD_V2_INLINE" ? "internal" : "external"}
                      onSwipeLeft={() => {
                        if (!isTop) return
                        buttonSwipe("left")
                      }}
                      onSwipeRight={() => {
                        if (!isTop) return
                        buttonSwipe("right")
                      }}
                      onUndo={() => {
                        if (!isTop) return
                        handleUndo()
                      }}
                      onBoost={(amount) => console.log("boost", amount)}
                    />
                  )
                }}
              />

              {activeCardDesign === "SP_CARD_V2_STACK" ? (
                <div className="pointer-events-none absolute inset-x-0 -bottom-16 z-40 flex items-center justify-center gap-5 min-[380px]:-bottom-18 sm:-bottom-20">
                <motion.button
                  onClick={() => buttonSwipe("left")}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-rose-100 bg-white/100 text-rose-500 opacity-100 shadow-[0_8px_20px_rgb(244,63,94,0.15)] transition-all hover:bg-rose-50"
                >
                  <X className="size-6" />
                </motion.button>
                <motion.button
                  onClick={handleUndo}
                  disabled={!canUndo || isAdvancing}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/100 text-slate-500 opacity-100 shadow-md transition-all disabled:opacity-40"
                >
                  <RotateCcw className="size-5" />
                </motion.button>
                <motion.button
                  onClick={() => buttonSwipe("right")}
                  disabled={!canSwipe}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100 bg-white/100 text-emerald-500 opacity-100 shadow-[0_8px_20px_rgb(16,185,129,0.15)] transition-all hover:bg-emerald-50 disabled:opacity-40"
                >
                  <ThumbsUp className="size-6" />
                </motion.button>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <div className="surface-panel flex h-full items-center justify-center rounded-2xl text-sm text-muted-foreground">
              No projects available for this category.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
