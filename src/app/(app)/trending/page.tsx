"use client"

import { useApp } from "@/context/AppContext"
import { TrendingSection } from "@/components/trending-section"
import { CommunityFunds } from "@/components/community-funds"
import { WeeklyDrop } from "@/components/weekly-drop"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { useShallow } from "zustand/react/shallow"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { Project } from "@/lib/useConvexData"

export default function TrendingPage() {
    const router = useRouter()
    const { cart, setCart, setUserStats, betaUserId, betaStatus, creditsRemaining, creditsMax, setCreditsRemaining } = useApp(useShallow((state) => ({
        cart: state.cart,
        setCart: state.setCart,
        setUserStats: state.setUserStats,
        betaUserId: state.betaUserId,
        betaStatus: state.betaStatus,
        creditsRemaining: state.creditsRemaining,
        creditsMax: state.creditsMax,
        setCreditsRemaining: state.setCreditsRemaining,
    })))
    const consumeCredits = useMutation(api.waitlist.consumeCredits)

    const canDonate = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0

    const handleDonate = async (project: Project, amount = 5) => {
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
        setUserStats((prev) => ({
            ...prev,
            totalDonations: prev.totalDonations + 1,
            lastDonation: new Date(),
        }))
    }

    const handleMockDonate = async (_project: Record<string, unknown>, _amount?: number) => {
        console.log("Mock donation:", _project, _amount)
    }

    return (
        <div className="space-y-6 p-6">
            {!canDonate ? (
                <div className="
                  rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3
                  py-2 text-xs text-yellow-100
                ">
                    You have no swipes left. Keep browsing or create an account to unlock more.
                </div>
            ) : (
                <div className="text-right text-xs text-gray-400 italic">
                    {creditsRemaining}/{creditsMax} swipes left
                </div>
            )}
            <TrendingSection onDonate={handleDonate} />
            <CommunityFunds onDonate={handleMockDonate} />
            <WeeklyDrop onDonate={handleDonate} />
            <button
                onClick={() => router.push('/')}
                className="
                  mt-6 w-full rounded-lg bg-gray-800 py-3 font-medium text-white
                  transition-colors
                  hover:bg-gray-700
                "
            >
                Back to Swipe
            </button>
        </div>
    )
}
