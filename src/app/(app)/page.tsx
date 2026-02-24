"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { useParams, usePathname } from "next/navigation"
import { useApp } from "@/context/AppContext"
import { ProjectCard } from "@/components/project-card"
import { useProjectsWithStatus } from "@/lib/useConvexData"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import type { Project } from "@/lib/useConvexData"
import { buildImageProxyUrl, getAdaptivePreloadAhead, isRemoteImageUrl } from "@/lib/image-delivery"
import type { ServerProject } from "@/lib/convex-server"

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
    prevProjectIndex: number
    prevSwipeCount: number
    prevCreditsRemaining: number
    prevCart: Array<{ project: unknown; amount: number; currency: string }>
    prevUserStats: UserStatsState
    prevUserProfile: UserProfileState
}

const TOP_CATEGORIES = ["See All", "Builders", "Eco Projects", "Dapps"] as const
type TopCategory = (typeof TOP_CATEGORIES)[number]
const LAST_FIRST_PROJECT_KEY = "swipepad:last-first-project-id"
const INITIAL_WARMUP_TIMEOUT_MS = 900

function getTopLevelCategory(category: string): TopCategory {
    const key = category.toLowerCase()
    if (key.includes("dapp")) return "Dapps"
    if (key.includes("eco") || key.includes("climate") || key.includes("regen") || key.includes("nature")) {
        return "Eco Projects"
    }
    return "Builders"
}

function toPreloadUrl(project: Project): string | null {
    if (!project.imageUrl || project.imageUrl === "NA" || project.imageUrl.includes("/placeholder.svg")) {
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

function wait(ms: number) {
    return new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms)
    })
}

function hashString(input: string): number {
    let hash = 2166136261

    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
    }

    return hash >>> 0
}

function createSeededRandom(seed: number) {
    let state = seed || 1

    return () => {
        state ^= state << 13
        state ^= state >>> 17
        state ^= state << 5
        return ((state >>> 0) % 10000) / 10000
    }
}

type HomeScreenProps = {
    initialProjectId?: string
    initialProject?: ServerProject | null
}

export function HomeScreen({ initialProjectId, initialProject = null }: HomeScreenProps = {}) {
    const { projects, isLoading: isProjectsLoading } = useProjectsWithStatus()
    const params = useParams<{ projectId?: string }>()
    const pathname = usePathname()
    const {
        currentProjectIndex,
        setCurrentProjectIndex,
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
    } = useApp(useShallow((state) => ({
        currentProjectIndex: state.currentProjectIndex,
        setCurrentProjectIndex: state.setCurrentProjectIndex,
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
    })))

    const [swipeHistory, setSwipeHistory] = useState<SwipeSnapshot[]>([])
    const preloadedUrlsRef = useRef<Set<string>>(new Set())
    const preloadingUrlsRef = useRef<Map<string, Promise<void>>>(new Map())
    const hasStartedWarmupRef = useRef(false)
    const lastHandledSharedProjectRef = useRef<string | null>(null)
    const [isFeedReady, setIsFeedReady] = useState(Boolean(initialProject))
    const [isFeedVisible, setIsFeedVisible] = useState(Boolean(initialProject))
    const canUndo = swipeHistory.length > 0

    const consumeCredits = useMutation(api.waitlist.consumeCredits)
    const recordSwipe = useMutation(api.waitlist.recordSwipe)

    const feedProjects = useMemo(() => {
        if (projects.length > 0) return projects
        if (initialProject) return [initialProject as Project]
        return []
    }, [initialProject, projects])

    const shuffledProjects = useMemo(() => {
        if (feedProjects.length <= 1) return feedProjects

        const next = [...feedProjects]
        const seedInput = next.map((project) => project.projectId).join("|")
        const random = createSeededRandom(hashString(seedInput))

        for (let i = next.length - 1; i > 0; i -= 1) {
            const j = Math.floor(random() * (i + 1))
            const temp = next[i]
            next[i] = next[j]
            next[j] = temp
        }

        return next
    }, [feedProjects])

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

    useEffect(() => {
        if (typeof window === "undefined") return
        if (shuffledProjects.length === 0) return

        window.localStorage.setItem(LAST_FIRST_PROJECT_KEY, shuffledProjects[0].projectId)
    }, [shuffledProjects])

    const categoryTabs = TOP_CATEGORIES
    const activeCategory = categoryTabs.includes(selectedCategory as TopCategory)
        ? (selectedCategory as TopCategory)
        : "See All"
    const filteredProjects = activeCategory === "See All"
        ? shuffledProjects
        : shuffledProjects.filter((project) => getTopLevelCategory(project.category) === activeCategory)
    const safeProjectIndex = useMemo(() => {
        if (filteredProjects.length === 0) return 0
        return Math.min(currentProjectIndex, filteredProjects.length - 1)
    }, [filteredProjects.length, currentProjectIndex])

    const sharedProjectId = params?.projectId || initialProjectId

    useEffect(() => {
        if (!sharedProjectId) return
        if (lastHandledSharedProjectRef.current === sharedProjectId) return
        if (shuffledProjects.length === 0) return

        const targetIndex = shuffledProjects.findIndex((project) => {
            return project.routeId === sharedProjectId
        })

        if (targetIndex < 0) return

        lastHandledSharedProjectRef.current = sharedProjectId
        setSelectedCategory("See All")
        setCurrentProjectIndex(targetIndex)
    }, [setCurrentProjectIndex, setSelectedCategory, sharedProjectId, shuffledProjects])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (filteredProjects.length === 0) return
        if (pathname.startsWith("/project/") && isProjectsLoading) return

        const currentProject = filteredProjects[safeProjectIndex]
        if (!currentProject?.routeId) return

        const nextPath = `/project/${encodeURIComponent(currentProject.routeId)}`
        if (pathname === nextPath) return

        window.history.replaceState(window.history.state, "", nextPath)
    }, [filteredProjects, isProjectsLoading, pathname, safeProjectIndex])

    useEffect(() => {
        if (filteredProjects.length === 0 && currentProjectIndex !== 0) {
            setCurrentProjectIndex(0)
            return
        }

        if (filteredProjects.length > 0 && currentProjectIndex > filteredProjects.length - 1) {
            setCurrentProjectIndex(filteredProjects.length - 1)
        }
    }, [filteredProjects.length, currentProjectIndex, setCurrentProjectIndex])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (isFeedReady || hasStartedWarmupRef.current) return
        if (isProjectsLoading) return

        const firstProject = filteredProjects[safeProjectIndex]
        if (!firstProject) return

        const connection = (navigator as Navigator & {
            connection?: { effectiveType?: string }
        }).connection
        const preloadAhead = getAdaptivePreloadAhead(connection?.effectiveType)
        const preloadEnd = Math.min(filteredProjects.length - 1, safeProjectIndex + preloadAhead)
        const preloadTargets = filteredProjects
            .slice(safeProjectIndex, preloadEnd + 1)
            .map(toPreloadUrl)
            .filter((url): url is string => Boolean(url))

        hasStartedWarmupRef.current = true
        let cancelled = false

        const warmup = async () => {
            const firstTarget = preloadTargets[0]
            if (firstTarget) {
                await Promise.race([
                    queueImagePreload(firstTarget),
                    wait(INITIAL_WARMUP_TIMEOUT_MS),
                ])
            }

            const rest = preloadTargets.slice(1)
            for (const target of rest) {
                void queueImagePreload(target)
            }

            if (!cancelled) {
                setIsFeedReady(true)
            }
        }

        void warmup()

        return () => {
            cancelled = true
        }
    }, [filteredProjects, isFeedReady, isProjectsLoading, safeProjectIndex])

    useEffect(() => {
        if (typeof window === "undefined") return
        if (!isFeedReady) return
        if (filteredProjects.length === 0) return

        const connection = (navigator as Navigator & {
            connection?: { effectiveType?: string }
        }).connection
        const preloadAhead = getAdaptivePreloadAhead(connection?.effectiveType)
        const start = safeProjectIndex + 1
        const end = Math.min(filteredProjects.length - 1, safeProjectIndex + preloadAhead)

        for (let index = start; index <= end; index += 1) {
            const candidate = filteredProjects[index]
            if (!candidate?.imageUrl) continue
            if (candidate.imageUrl === "NA" || candidate.imageUrl.includes("/placeholder.svg")) continue
            if (!isRemoteImageUrl(candidate.imageUrl)) continue

            const proxyUrl = buildImageProxyUrl(candidate.imageUrl, { width: 1080, quality: 75 })
            void queueImagePreload(proxyUrl)
        }
    }, [filteredProjects, isFeedReady, safeProjectIndex])

    useEffect(() => {
        if (!isFeedReady) return

        const timer = window.setTimeout(() => {
            setIsFeedVisible(true)
        }, 120)

        return () => {
            window.clearTimeout(timer)
        }
    }, [isFeedReady])

    const canSwipe = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0
    const effectiveDonationAmount = donationAmount ?? "0.01¢"
    const totalSwipes = userProfile.totalSwipes ?? 0
    const level = Math.max(1, Math.floor(totalSwipes / 25) + 1)
    const xpInLevel = totalSwipes % 500
    const xpProgress = (xpInLevel / 500) * 100
    const shouldShowWarmup = !isFeedVisible && (isProjectsLoading || filteredProjects.length > 0)

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        setCurrentProjectIndex(0)
    }
    const handleSwipeRight = async () => {
        if (!canSwipe || !betaUserId) return
        const project = filteredProjects[safeProjectIndex]
        if (!project) return
        const snapshot: SwipeSnapshot = {
            prevProjectIndex: safeProjectIndex,
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
        }

        try {
            const result = await consumeCredits({
                userId: betaUserId as Id<"waitlistUsers">,
                chain: "celo",
                amount: 1,
            })
            setCreditsRemaining(result.remaining)
        } catch (error) {
            console.error("Failed to consume credits:", error)
            return
        }

        setUserStats((prev: UserStatsState) => {
            const categoriesSupported = new Set(prev.categoriesSupported)
            categoriesSupported.add(project.category)
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

        setCart([...cart, { project, amount: amountNum, currency: donationCurrency }])

        if (betaUserId) {
            recordSwipe({
                userId: betaUserId as Id<"waitlistUsers">,
                projectId: project.projectId,
                direction: "right",
                amount: amountNum,
            }).catch((error) => console.error("Failed to record swipe:", error))
        }

        const newCount = swipeCount + 1
        if (newCount >= confirmSwipes) {
            setSwipeCount(0)
        } else {
            setSwipeCount(newCount)
        }

        setCurrentProjectIndex(safeProjectIndex < filteredProjects.length - 1 ? safeProjectIndex + 1 : 0)
        setSwipeHistory((prev: SwipeSnapshot[]) => [...prev, snapshot])
    }

    const handleSwipeLeft = () => {
        const project = filteredProjects[safeProjectIndex]
        if (!project) return

        const snapshot: SwipeSnapshot = {
            prevProjectIndex: safeProjectIndex,
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
        }

        setUserProfile((prev: UserProfileState) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))
        if (betaUserId) {
            recordSwipe({
                userId: betaUserId as Id<"waitlistUsers">,
                projectId: project.projectId,
                direction: "left",
            }).catch((error) => console.error("Failed to record swipe:", error))
        }
        setCurrentProjectIndex(safeProjectIndex < filteredProjects.length - 1 ? safeProjectIndex + 1 : 0)
        setSwipeHistory((prev: SwipeSnapshot[]) => [...prev, snapshot])
    }

    const handleUndo = () => {
        setSwipeHistory((prev: SwipeSnapshot[]) => {
            if (prev.length === 0) return prev

            const next = [...prev]
            const last = next.pop()
            if (!last) return prev

            setCurrentProjectIndex(last.prevProjectIndex)
            setSwipeCount(last.prevSwipeCount)
            setCreditsRemaining(last.prevCreditsRemaining)
            setCart(last.prevCart)
            setUserStats(last.prevUserStats)
            setUserProfile(last.prevUserProfile)

            return next
        })
    }

    return (
        <div className="
          flex h-full min-h-0 flex-col overflow-hidden px-3 pt-1 pb-3
        ">
            <div className="mb-2">
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                    {categoryTabs.map((category) => {
                        const active = activeCategory === category

                        return (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`
                                  shrink-0 rounded-full border px-3.5 py-1.5
                                  text-xs font-semibold transition-colors
                                  sm:px-4 sm:py-2 sm:text-sm
                                  ${active
                                        ? `
                                          border-[#f9de4b] bg-[#f9de4b]
                                          text-black
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
                    })}
                </div>
            </div>

            <div className="mb-2 flex items-end justify-between">
                <div>
                    <p className="
                      text-[10px] font-medium tracking-wide text-gray-400
                    ">YOUR LEVEL</p>
                    <p className="
                      font-display text-2xl leading-none tracking-wide
                      text-white
                      sm:text-3xl
                    ">LVL {level}</p>
                </div>

                <div className="
                  w-36 pb-1
                  sm:w-40
                ">
                    <p className="
                      mb-1 text-right text-[10px] text-gray-300
                      sm:text-xs
                    ">{xpInLevel} / 500 XP</p>
                    <div className="
                      h-1.5 overflow-hidden rounded-full bg-[#203150]
                    ">
                        <div className="
                          h-full bg-[#395079] transition-all duration-300
                        " style={{ width: `${xpProgress}%` }} />
                    </div>
                </div>
            </div>

            <div className="
              flex min-h-0 flex-1 items-center justify-center overflow-hidden
              py-1
            ">
                <div className="
                  aspect-5/8 h-[min(100%,740px)] w-auto max-w-full
                  sm:h-[min(100%,820px)]
                  lg:h-[min(100%,920px)]
                ">
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
                    ) : filteredProjects.length > 0 ? (
                        <div className={`size-full transition-opacity duration-500 ${isFeedVisible ? "opacity-100" : "opacity-0"}`}>
                            <ProjectCard
                                className="size-full"
                                project={filteredProjects[safeProjectIndex]}
                                projectPathId={filteredProjects[safeProjectIndex].routeId}
                                isLoading={false}
                                showImageLoader={false}
                                onSwipeLeft={handleSwipeLeft}
                                onSwipeRight={!canSwipe ? undefined : handleSwipeRight}
                                onUndo={canUndo ? handleUndo : undefined}
                                viewMode="swipe"
                                donationAmount={effectiveDonationAmount}
                                donationCurrency={donationCurrency}
                                onBoost={(amount) => console.log('boost', amount)}
                            />
                        </div>
                    ) : (
                        <div className="
                          surface-panel flex h-full items-center justify-center
                          rounded-2xl text-sm text-muted-foreground
                        ">
                            No projects available for this category.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return <HomeScreen />
}
