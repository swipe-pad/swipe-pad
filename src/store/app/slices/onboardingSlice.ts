import type { AppSliceCreator } from "@/store/app/slices/utils"
import { resolveUpdater } from "@/store/app/slices/utils"
import type { AppStore } from "@/store/app/types"

const ONBOARDING_STORAGE_KEY = "swipepad:onboarding-complete"

type OnboardingSlice = Pick<
  AppStore,
  | "hasCompletedOnboarding"
  | "setHasCompletedOnboarding"
  | "hasLoadedOnboardingState"
  | "hydrateOnboardingState"
>

export const createOnboardingSlice: AppSliceCreator<OnboardingSlice> = (set) => ({
  hasCompletedOnboarding: false,
  hasLoadedOnboardingState: false,
  setHasCompletedOnboarding: (next) =>
    set((state) => {
      const resolved = resolveUpdater(next, state.hasCompletedOnboarding)

      try {
        window.localStorage.setItem(ONBOARDING_STORAGE_KEY, resolved ? "1" : "0")
      } catch (error) {
        console.error("Failed to persist onboarding state:", error)
      }

      return { hasCompletedOnboarding: resolved }
    }),
  hydrateOnboardingState: () => {
    try {
      const stored = window.localStorage.getItem(ONBOARDING_STORAGE_KEY)
      set({ hasCompletedOnboarding: stored === "1" })
    } catch (error) {
      console.error("Failed to read onboarding state:", error)
    } finally {
      set({ hasLoadedOnboardingState: true })
    }
  },
})
