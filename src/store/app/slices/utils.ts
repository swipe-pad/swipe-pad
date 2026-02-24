import type { StateCreator } from "zustand"

import type { AppStateUpdater, AppStore } from "@/store/app/types"

export type AppSliceCreator<TSlice> = StateCreator<AppStore, [], [], TSlice>

export function resolveUpdater<TState>(
  updater: AppStateUpdater<TState>,
  previous: TState
): TState {
  return typeof updater === "function"
    ? (updater as (prev: TState) => TState)(previous)
    : updater
}
