"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"

import { useApp } from "@/context/AppContext"
import { ProjectCard } from "@/components/project-card"
import type { Project } from "@/lib/useConvexData"
import { buildImageProxyUrl, isRemoteImageUrl } from "@/lib/image-delivery"
import type { ServerProject } from "@/lib/convex-server"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"

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

type SwipeSnapshot = {
  prevProject: Project | null
  prevCurrentProject: Project | null
  prevNextProject: Project | null
  prevSwipeCount: number
  prevCreditsRemaining: number
  prevCart: Array<{ project: unknown; amount: number; currency: string }>
  prevUserStats: UserStatsState
  prevUserProfile: UserProfileState
}

const TOP_CATEGORIES = ["See All", "Builders", "Eco Projects", "Dapps"] as const
type TopCategory = (typeof TOP_CATEGORIES)[number]
const INITIAL_WARMUP_TIMEOUT_MS = 900

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function getTopLevelCategory(category: string): TopCategory {
  const key = category.toLowerCase()
  if (key.includes("dapp")) return "Dapps"
  if (key.includes("eco") || key.includes("climate") || key.includes("regen") || key.includes("nature")) {
    return "Eco Projects"
  }
  return "Builders"
}

function toPreloadUrl(project: Project | null): string | null {
  if (!project?.imageUrl || project.imageUrl === "NA" || project.imageUrl.includes("/placeholder.svg")) {
    return null
  }

  if (!isRemoteImageUrl(project.imageUrl)) {
    return project.imageUrl
  }

  return buildImageProxyUrl(project.imageUrl, {
    width: 1080,
    quality: 75,
  })
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
  const [prevProject, setPrevProject] = useState<Project | null>(null)
  const [currentProject, setCurrentProject] = useState<Project | null>((initialProject as Project | null) ?? null)
  const [nextProject, setNextProject] = useState<Project | null>(null)
  const [swipeHistory, setSwipeHistory] = useState<SwipeSnapshot[]>([])
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [isFeedVisible, setIsFeedVisible] = useState(Boolean(initialProject))

  const canUndo = swipeHistory.length > 0
  const canSwipe = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0
  const effectiveDonationAmount = donationAmount ?? "0.01¢"
  const totalSwipes = userProfile.totalSwipes ?? 0
  const level = Math.max(1, Math.floor(totalSwipes / 25) + 1)
  const xpInLevel = totalSwipes % 500
  const xpProgress = (xpInLevel / 500) * 100

  const categoryTabs = TOP_CATEGORIES
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
  const inFlightPrefetchRef = useRef(false)

  const consumeCredits = useMutation(api.waitlist.consumeCredits)
  const recordSwipe = useMutation(api.waitlist.recordSwipe)

  const stack = useMemo(() => {
    return [prevProject, currentProject, nextProject].filter(Boolean) as Project[]
  }, [prevProject, currentProject, nextProject])

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
    return getTopLevelCategory(project.category) === category
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

      const response = await fetch(url.toString(), { cache: "no-store" })
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
    }

    return null
  }, [activeCategory])

  const prefetchNextProject = useCallback(async (fromProject: Project, category: TopCategory) => {
    if (mode !== "discover") return
    if (inFlightPrefetchRef.current) return

    inFlightPrefetchRef.current = true
    try {
      const prefetched = await fetchFeedProject({
        exclude: fromProject.projectId || fromProject.routeId,
        category,
      })
      if (prefetched) {
        setNextProject(prefetched)
      }
    } finally {
      inFlightPrefetchRef.current = false
    }
  }, [fetchFeedProject, mode])

  const advanceDiscoverStream = async () => {
    if (!currentProject) return

    let incoming = nextProject
    if (!incoming) {
      incoming = await fetchFeedProject({
        exclude: currentProject.projectId || currentProject.routeId,
        category: activeCategory,
      })
    }

    if (!incoming) return

    setPrevProject(currentProject)
    setCurrentProject(incoming)
    setNextProject(null)

    await prefetchNextProject(incoming, activeCategory)
  }

  const transitionFromSharedToDiscover = async () => {
    if (!currentProject) return

    setMode("discover")
    setSelectedCategory("See All")
    router.replace("/")

    const discoverProject = await fetchFeedProject({
      exclude: currentProject.projectId || currentProject.routeId,
      category: "See All",
    })

    if (!discoverProject) return

    setPrevProject(null)
    setCurrentProject(discoverProject)
    setNextProject(null)

    await prefetchNextProject(discoverProject, "See All")
  }

  useEffect(() => {
    if (mode !== "discover") return
    if (currentProject) return

    let cancelled = false
    const loadInitial = async () => {
      const project = await fetchFeedProject({ category: activeCategory })
      if (!cancelled && project) {
        setCurrentProject(project)
      }
    }

    void loadInitial()

    return () => {
      cancelled = true
    }
  }, [activeCategory, currentProject, fetchFeedProject, mode])

  useEffect(() => {
    if (mode !== "discover") return
    if (!currentProject || nextProject) return

    void prefetchNextProject(currentProject, activeCategory)
  }, [activeCategory, currentProject, mode, nextProject, prefetchNextProject])

  useEffect(() => {
    if (mode !== "discover") return
    setNextProject(null)
  }, [activeCategory, mode])

  useEffect(() => {
    const currentUrl = toPreloadUrl(currentProject)
    const nextUrl = toPreloadUrl(nextProject)

    if (!currentUrl && !nextUrl) {
      setIsFeedVisible(Boolean(currentProject))
      return
    }

    let cancelled = false
    setIsFeedVisible(false)

    const warmup = async () => {
      if (currentUrl) {
        await Promise.race([queueImagePreload(currentUrl), wait(INITIAL_WARMUP_TIMEOUT_MS)])
      }

      if (nextUrl) {
        void queueImagePreload(nextUrl)
      }

      if (!cancelled) {
        setIsFeedVisible(true)
      }
    }

    void warmup()

    return () => {
      cancelled = true
    }
  }, [currentProject, nextProject])

  const handleCategoryChange = (category: string) => {
    if (mode === "shared-entry") return
    setSelectedCategory(category)
  }

  const buildSnapshot = (): SwipeSnapshot => ({
    prevProject,
    prevCurrentProject: currentProject,
    prevNextProject: nextProject,
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
  })

  const handleSwipeRight = async () => {
    if (!canSwipe || !betaUserId || !currentProject || isAdvancing) return

    setIsAdvancing(true)
    const snapshot = buildSnapshot()

    try {
      const creditsResult = await consumeCredits({
        userId: betaUserId as Id<"waitlistUsers">,
        chain: "celo",
        amount: 1,
      })
      setCreditsRemaining(creditsResult.remaining)

      setUserStats((prev: UserStatsState) => {
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
      setUserProfile((prev: UserProfileState) => ({
        ...prev,
        totalSwipes: prev.totalSwipes + 1,
        totalDonated: prev.totalDonated + amountNum,
      }))

      setCart([...cart, { project: currentProject, amount: amountNum, currency: donationCurrency }])

      recordSwipe({
        userId: betaUserId as Id<"waitlistUsers">,
        projectId: currentProject.projectId,
        direction: "right",
        amount: amountNum,
      }).catch((error) => console.error("Failed to record swipe:", error))

      const newCount = swipeCount + 1
      if (newCount >= confirmSwipes) {
        setSwipeCount(0)
      } else {
        setSwipeCount(newCount)
      }

      if (mode === "shared-entry") {
        await transitionFromSharedToDiscover()
      } else {
        await advanceDiscoverStream()
      }

      setSwipeHistory((prev) => [...prev, snapshot])
    } catch (error) {
      console.error("Failed to process right swipe:", error)
    } finally {
      setIsAdvancing(false)
    }
  }

  const handleSwipeLeft = async () => {
    if (!currentProject || isAdvancing) return

    setIsAdvancing(true)
    const snapshot = buildSnapshot()

    try {
      setUserProfile((prev: UserProfileState) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))

      if (betaUserId) {
        recordSwipe({
          userId: betaUserId as Id<"waitlistUsers">,
          projectId: currentProject.projectId,
          direction: "left",
        }).catch((error) => console.error("Failed to record swipe:", error))
      }

      if (mode === "shared-entry") {
        await transitionFromSharedToDiscover()
      } else {
        await advanceDiscoverStream()
      }

      setSwipeHistory((prev) => [...prev, snapshot])
    } finally {
      setIsAdvancing(false)
    }
  }

  const handleUndo = () => {
    setSwipeHistory((prev) => {
      if (prev.length === 0) return prev

      const next = [...prev]
      const last = next.pop()
      if (!last) return prev

      setPrevProject(last.prevProject)
      setCurrentProject(last.prevCurrentProject)
      setNextProject(last.prevNextProject)
      setSwipeCount(last.prevSwipeCount)
      setCreditsRemaining(last.prevCreditsRemaining)
      setCart(last.prevCart)
      setUserStats(last.prevUserStats)
      setUserProfile(last.prevUserProfile)

      return next
    })
  }

  const shouldShowWarmup = !isFeedVisible && (Boolean(currentProject) || stack.length > 0)

  return (
    <div className="flex h-full min-h-0 flex-col px-3 pt-1 pb-3">
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

      <div className="flex min-h-0 flex-1 items-center justify-center py-1">
        <div className="aspect-5/8 h-[min(100%,740px)] w-auto max-w-full sm:h-[min(100%,820px)] lg:h-[min(100%,920px)]">
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
            <div className={`size-full transition-opacity duration-500 ${isFeedVisible ? "opacity-100" : "opacity-0"}`}>
              <ProjectCard
                className="size-full"
                project={currentProject}
                projectPathId={currentProject.routeId}
                isLoading={false}
                showImageLoader={false}
                onSwipeLeft={isAdvancing ? undefined : handleSwipeLeft}
                onSwipeRight={!canSwipe || isAdvancing ? undefined : handleSwipeRight}
                onUndo={canUndo && !isAdvancing ? handleUndo : undefined}
                viewMode="swipe"
                donationAmount={effectiveDonationAmount}
                donationCurrency={donationCurrency}
                onBoost={(amount) => console.log("boost", amount)}
              />
            </div>
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
