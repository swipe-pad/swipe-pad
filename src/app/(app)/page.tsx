"use client"

import { useApp } from "@/context/AppContext"
import { ToggleMenu } from "@/components/toggle-menu"
import { CategoryMenu } from "@/components/category-menu"
import { ProjectCard } from "@/components/project-card"
import { AmountSelector } from "@/components/amount-selector"
import { useProjects, useCategories } from "@/lib/useConvexData"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"

export default function Home() {
    const router = useRouter()
    const projects = useProjects()
    const categories = useCategories()
    const {
        currentProjectIndex, setCurrentProjectIndex,
        selectedCategory, setSelectedCategory,
        donationAmount, setDonationAmount,
        donationCurrency, setDonationCurrency,
        confirmSwipes, setConfirmSwipes,
        swipeCount, setSwipeCount,
        setUserStats, setUserProfile,
        cart, setCart,
        betaUserId,
        betaStatus,
        creditsRemaining, setCreditsRemaining,
        creditsMax,
    } = useApp()

    const consumeCredits = useMutation(api.waitlist.consumeCredits)
    const recordSwipe = useMutation(api.waitlist.recordSwipe)

    const filteredProjects = projects.filter((project) => project.category === selectedCategory)

    const canSwipe = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0

    const handleSwipeRight = async () => {
        if (donationAmount === null) return
        if (!canSwipe || !betaUserId) return
        const project = filteredProjects[currentProjectIndex]

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

        setUserStats((prev: any) => {
            const categoriesSupported = new Set(prev.categoriesSupported)
            categoriesSupported.add(project.category)
            return {
                totalDonations: prev.totalDonations + 1,
                categoriesSupported,
                streak: prev.lastDonation ? prev.streak + 1 : 1,
                lastDonation: new Date(),
            }
        })

        const amountNum = typeof donationAmount === 'string' ? parseFloat(donationAmount.split(" ")[0]) : 0.01
        setUserProfile((prev: any) => ({
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

        setCurrentProjectIndex(currentProjectIndex < filteredProjects.length - 1 ? currentProjectIndex + 1 : 0)
    }

    const handleSwipeLeft = () => {
        setUserProfile((prev: any) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))
        if (betaUserId) {
            recordSwipe({
                userId: betaUserId as Id<"waitlistUsers">,
                projectId: filteredProjects[currentProjectIndex]?.projectId ?? "",
                direction: "left",
            }).catch((error) => console.error("Failed to record swipe:", error))
        }
        setCurrentProjectIndex(currentProjectIndex < filteredProjects.length - 1 ? currentProjectIndex + 1 : 0)
    }

    return (
        <div className="py-6">
            <ToggleMenu viewMode="swipe" setViewMode={(mode) => mode === 'list' && router.push('/list')} />

            {donationAmount === null ? (
                <AmountSelector onSelect={(amount, currency, swipes) => {
                    if (!document.startViewTransition) {
                        setDonationAmount(amount)
                        setDonationCurrency(currency)
                        setConfirmSwipes(swipes)
                        setSwipeCount(0)
                        return
                    }
                    document.startViewTransition(() => {
                        setDonationAmount(amount)
                        setDonationCurrency(currency)
                        setConfirmSwipes(swipes)
                        setSwipeCount(0)
                    })
                }} />
            ) : (
                <>
                    <CategoryMenu
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        setCurrentProjectIndex={() => setCurrentProjectIndex(0)}
                    />

                    <div className="mb-2 px-6">
                        {!canSwipe ? (
                            <div className="
                              mb-3 rounded-lg border border-yellow-500/30
                              bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100
                            ">
                                You have no swipes left. Keep browsing or create an account to unlock more.
                            </div>
                        ) : null}
                        <div className="flex items-center justify-between">
                            <div className="
                              rounded-lg border border-gray-700/50
                              bg-gray-800/50 p-2 px-3 backdrop-blur-sm
                            ">
                                <span className="text-sm text-gray-300">Donating: </span>
                                <span className="font-bold text-[#FFD600]">
                                    {donationAmount} {donationCurrency}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (document.startViewTransition) {
                                        document.startViewTransition(() => setDonationAmount(null))
                                    } else {
                                        setDonationAmount(null)
                                    }
                                }}
                                className="
                                  text-sm text-gray-400 underline
                                  transition-colors
                                  hover:text-white
                                "
                            >
                                Change
                            </button>
                        </div>
                        <div className="
                          mt-4 h-3 overflow-hidden rounded-full border
                          border-gray-700/30 bg-gray-800/30
                        ">
                            <div
                                className="
                                  h-full bg-linear-to-r from-[#FFD600]
                                  to-yellow-500
                                  shadow-[0_0_10px_rgba(255,214,0,0.5)]
                                  transition-all duration-500 ease-out
                                "
                                style={{ width: `${(swipeCount / confirmSwipes) * 100}%` }}
                            ></div>
                        </div>
                        <p className="
                          mt-1 text-right text-[10px] text-gray-500 italic
                        ">
                            {confirmSwipes - swipeCount} swipes to confirm
                        </p>
                        <p className="
                          mt-1 text-right text-[10px] text-gray-500 italic
                        ">
                            {creditsRemaining}/{creditsMax} swipes left
                        </p>
                    </div>

                    <div className="mt-4 px-6">
                        {filteredProjects.length > 0 && (
                            <ProjectCard
                                project={filteredProjects[currentProjectIndex]}
                                onSwipeLeft={handleSwipeLeft}
                                onSwipeRight={canSwipe ? handleSwipeRight : undefined}
                                viewMode="swipe"
                                donationAmount={donationAmount}
                                donationCurrency={donationCurrency}
                                onBoost={(amount) => console.log('boost', amount)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
