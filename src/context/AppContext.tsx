"use client"

import { useEffect, type ReactNode } from "react"

import { useAppStore } from "@/store/app/store"
import type { AppStore } from "@/store/app/types"

type Selector<TSelected> = (state: AppStore) => TSelected

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrateOnboardingState = useAppStore((state) => state.hydrateOnboardingState)
  const hasLoadedOnboardingState = useAppStore((state) => state.hasLoadedOnboardingState)

  useEffect(() => {
    if (!hasLoadedOnboardingState) {
      hydrateOnboardingState()
    }
  }, [hasLoadedOnboardingState, hydrateOnboardingState])

  return children
}

export function useApp<TSelected>(selector: Selector<TSelected>): TSelected {
  return useAppStore(selector)
}
