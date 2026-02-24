"use client"

import { useMemo } from "react"

import { LeaderboardView } from "@/components/leaderboard/LeaderboardView"
import { useApp } from "@/context/AppContext"

export default function LeaderboardPage() {
  const { userProfile, userStats } = useApp()

  const currentUserPoints = Math.max(120, userStats.totalDonations * 12 + userStats.streak * 9)
  const currentUserLevel = Math.max(1, Math.floor(currentUserPoints / 80))

  const entries = useMemo(() => {
    const baseline = [
      { rank: 1, name: "Ada Regen", level: 9, points: 1230 },
      { rank: 2, name: "CeloNomad", level: 8, points: 1104 },
      { rank: 3, name: "Sol Garden", level: 8, points: 1035 },
      { rank: 4, name: "Forest Loop", level: 7, points: 920 },
      {
        rank: 5,
        name: userProfile.name || "MiniPay User",
        level: currentUserLevel,
        points: currentUserPoints,
        isCurrentUser: true,
      },
      { rank: 6, name: "River Batch", level: 6, points: 765 },
      { rank: 7, name: "Open Agro", level: 6, points: 710 },
      { rank: 8, name: "Bio Stack", level: 5, points: 644 },
      { rank: 9, name: "Green Peer", level: 5, points: 601 },
      { rank: 10, name: "Eco Rollup", level: 4, points: 540 },
    ]

    return baseline
  }, [currentUserLevel, currentUserPoints, userProfile.name])

  return (
    <LeaderboardView
      entries={entries}
      currentUserName={userProfile.name || "MiniPay User"}
      currentUserRank={5}
      currentUserLevel={currentUserLevel}
      currentUserPoints={currentUserPoints}
    />
  )
}
