"use client"

import { useMemo } from "react"

export interface AppShellConfig {
  showHeader: boolean
  showBottomNav: boolean
  highlightTrending: boolean
  highlightLeaderboard: boolean
}

export function useAppShellConfig(pathname: string): AppShellConfig {
  return useMemo(() => {
    const inAppRoute =
      pathname === "/" ||
      pathname.startsWith("/p/") ||
      pathname.startsWith("/list") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/leaderboard") ||
      pathname.startsWith("/trending")

    return {
      showHeader: inAppRoute,
      showBottomNav: inAppRoute,
      highlightTrending: pathname.startsWith("/trending"),
      highlightLeaderboard: pathname.startsWith("/leaderboard"),
    }
  }, [pathname])
}
