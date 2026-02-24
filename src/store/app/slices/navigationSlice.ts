import type { AppSliceCreator } from "@/store/app/slices/utils"
import { resolveUpdater } from "@/store/app/slices/utils"
import type { AppStore } from "@/store/app/types"

type NavigationSlice = Pick<
  AppStore,
  "selectedCategory" | "setSelectedCategory" | "currentProjectIndex" | "setCurrentProjectIndex"
>

export const createNavigationSlice: AppSliceCreator<NavigationSlice> = (set) => ({
  selectedCategory: "Regeneration",
  currentProjectIndex: 0,
  setSelectedCategory: (next) =>
    set((state) => ({ selectedCategory: resolveUpdater(next, state.selectedCategory) })),
  setCurrentProjectIndex: (next) =>
    set((state) => ({ currentProjectIndex: resolveUpdater(next, state.currentProjectIndex) })),
})
