"use client"

import { Trophy, Medal } from "lucide-react"

type LeaderboardEntry = {
  rank: number
  name: string
  level: number
  points: number
  isCurrentUser?: boolean
}

interface LeaderboardViewProps {
  entries: LeaderboardEntry[]
  currentUserName: string
  currentUserRank: number
  currentUserLevel: number
  currentUserPoints: number
}

export function LeaderboardView({
  entries,
  currentUserName,
  currentUserRank,
  currentUserLevel,
  currentUserPoints,
}: LeaderboardViewProps) {
  return (
    <div className="space-y-4 p-6">
      <section className="surface-panel-strong rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Trophy className="size-5" />
          <h1 className="text-lg font-semibold text-white">Leaderboard</h1>
        </div>

        <p className="text-sm text-muted-foreground">Global ranking by verified support and consistent impact.</p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rank</p>
            <p className="text-base font-semibold text-white">#{currentUserRank}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Level</p>
            <p className="text-base font-semibold text-white">Lv {currentUserLevel}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Points</p>
            <p className="text-base font-semibold text-primary">{currentUserPoints}</p>
          </div>
        </div>

        <p className="mt-3 truncate text-sm text-white">You are ranked as {currentUserName}</p>
      </section>

      <section className="surface-panel rounded-2xl p-3">
        <div className="mb-2 flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <Medal className="size-4" />
          <span>Top supporters</span>
        </div>

        <div className="space-y-2">
          {entries.map((entry) => (
            <article
              key={`${entry.rank}-${entry.name}`}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                entry.isCurrentUser
                  ? "border-primary/60 bg-primary/10"
                  : "border-surface-border bg-surface-2"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center text-sm font-semibold text-muted-foreground">#{entry.rank}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                </div>
              </div>

              <p className="text-sm font-semibold text-primary">{entry.points}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
