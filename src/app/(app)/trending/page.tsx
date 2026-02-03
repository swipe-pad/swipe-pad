"use client"

import { useApp } from "@/context/AppContext"
import { TrendingSection } from "@/components/trending-section"
import { CommunityFunds } from "@/components/community-funds"
import { WeeklyDrop } from "@/components/weekly-drop"
import { useRouter } from "next/navigation"

export default function TrendingPage() {
    const router = useRouter()
    const { cart, setCart, setUserStats } = useApp()

    const handleDonate = (project: any, amount = 5) => {
        setCart([...cart, { project, amount, currency: "cUSD" }])
        setUserStats((prev: any) => ({
            ...prev,
            totalDonations: prev.totalDonations + 1,
            lastDonation: new Date(),
        }))
    }

    return (
        <div className="px-6 py-6 space-y-6">
            <TrendingSection onDonate={handleDonate} />
            <CommunityFunds onDonate={handleDonate} />
            <WeeklyDrop onDonate={handleDonate} />
            <button
                onClick={() => router.push('/')}
                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors mt-6"
            >
                Back to Swipe
            </button>
        </div>
    )
}
