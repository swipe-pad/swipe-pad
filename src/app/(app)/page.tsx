"use client"

import { useEffect, useMemo, useState } from "react"
import { useApp } from "@/context/AppContext"
import { ProjectCard } from "@/components/project-card"
import { useProjects } from "@/lib/useConvexData"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"

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

function getTopLevelCategory(category: string): TopCategory {
    const key = category.toLowerCase()
    if (key.includes("dapp")) return "Dapps"
    if (key.includes("eco") || key.includes("climate") || key.includes("regen") || key.includes("nature")) {
        return "Eco Projects"
    }
    return "Builders"
}

export default function Home() {
    const projects = useProjects()
    const {
        currentProjectIndex, setCurrentProjectIndex,
        selectedCategory, setSelectedCategory,
        donationAmount,
        donationCurrency,
        confirmSwipes,
        swipeCount, setSwipeCount,
        userStats, setUserStats,
        userProfile, setUserProfile,
        cart, setCart,
        betaUserId,
        betaStatus,
        creditsRemaining, setCreditsRemaining,
    } = useApp()

    const [swipeHistory, setSwipeHistory] = useState<SwipeSnapshot[]>([])
    const canUndo = swipeHistory.length > 0

    const consumeCredits = useMutation(api.waitlist.consumeCredits)
    const recordSwipe = useMutation(api.waitlist.recordSwipe)

    const categoryTabs = TOP_CATEGORIES
    const activeCategory = categoryTabs.includes(selectedCategory as TopCategory)
        ? (selectedCategory as TopCategory)
        : "See All"
    const filteredProjects = activeCategory === "See All"
        ? projects
        : projects.filter((project) => getTopLevelCategory(project.category) === activeCategory)

    const safeProjectIndex = useMemo(() => {
        if (filteredProjects.length === 0) return 0
        return Math.min(currentProjectIndex, filteredProjects.length - 1)
    }, [filteredProjects.length, currentProjectIndex])

    useEffect(() => {
        if (filteredProjects.length === 0 && currentProjectIndex !== 0) {
            setCurrentProjectIndex(0)
            return
        }

        if (filteredProjects.length > 0 && currentProjectIndex > filteredProjects.length - 1) {
            setCurrentProjectIndex(filteredProjects.length - 1)
        }
    }, [filteredProjects.length, currentProjectIndex, setCurrentProjectIndex])

    const canSwipe = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0
    const effectiveDonationAmount = donationAmount ?? "0.01¢"
    const totalSwipes = userProfile.totalSwipes ?? 0
    const level = Math.max(1, Math.floor(totalSwipes / 25) + 1)
    const xpInLevel = totalSwipes % 500
    const xpProgress = (xpInLevel / 500) * 100

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
                    {filteredProjects.length > 0 ? (
                        <ProjectCard
                            className="size-full"
                            project={filteredProjects[safeProjectIndex]}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={canSwipe ? handleSwipeRight : undefined}
                            onUndo={canUndo ? handleUndo : undefined}
                            viewMode="swipe"
                            donationAmount={effectiveDonationAmount}
                            donationCurrency={donationCurrency}
                            onBoost={(amount) => console.log('boost', amount)}
                        />
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
