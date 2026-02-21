"use client"

import { useApp } from "@/context/AppContext"
import { ToggleMenu } from "@/components/toggle-menu"
import { CategorySection } from "@/components/category-section"
import { useProjects, useCategories } from "@/lib/useConvexData"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"

export default function ListPage() {
    const router = useRouter()
    const { cart, setCart, setUserStats, betaUserId, betaStatus, creditsRemaining, creditsMax, setCreditsRemaining } = useApp()
    const projects = useProjects()
    const categories = useCategories()
    const consumeCredits = useMutation(api.waitlist.consumeCredits)

    const projectsByCategory = categories.reduce(
        (acc: any, category: string) => {
            const categoryProjects = projects.filter((project) => project.category === category)
            if (categoryProjects.length > 0) acc[category] = categoryProjects
            return acc
        }, {} as Record<string, typeof projects>
    )

    const canDonate = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0

    const handleDonate = async (project: any, amount = 5) => {
        if (!canDonate || !betaUserId) return
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
        setCart([...cart, { project, amount, currency: "cUSD" }])
        setUserStats((prev: any) => ({
            ...prev,
            totalDonations: prev.totalDonations + 1,
            lastDonation: new Date(),
        }))
    }

    return (
        <div className="py-6">
            <ToggleMenu viewMode="list" setViewMode={(mode) => mode === 'swipe' && router.push('/')} />
            {!canDonate ? (
                <div className="
                  mx-6 mb-4 rounded-lg border border-yellow-500/30
                  bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100
                ">
                    You have no swipes left. Keep browsing or create an account to unlock more.
                </div>
            ) : (
                <div className="
                  mx-6 mb-4 text-right text-xs text-gray-400 italic
                ">
                    {creditsRemaining}/{creditsMax} swipes left
                </div>
            )}
            <div className="space-y-8 px-6">
                {Object.entries(projectsByCategory).map(([category, categoryProjects]) => (
                    <CategorySection
                        key={category}
                        category={category}
                        projects={categoryProjects as any}
                        onDonate={handleDonate}
                    />
                ))}
            </div>
        </div>
    )
}
