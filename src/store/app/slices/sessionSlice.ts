import type { AppSliceCreator } from "@/store/app/slices/utils"
import { resolveUpdater } from "@/store/app/slices/utils"
import type { AppStore } from "@/store/app/types"

type SessionSlice = Pick<
  AppStore,
  | "walletConnected"
  | "setWalletConnected"
  | "walletAddress"
  | "setWalletAddress"
  | "betaUserId"
  | "setBetaUserId"
  | "betaStatus"
  | "setBetaStatus"
  | "creditsRemaining"
  | "setCreditsRemaining"
  | "creditsMax"
  | "setCreditsMax"
  | "accessState"
  | "setAccessState"
  | "accessReason"
  | "setAccessReason"
>

export const createSessionSlice: AppSliceCreator<SessionSlice> = (set) => ({
  walletConnected: false,
  walletAddress: null,
  betaUserId: null,
  betaStatus: null,
  creditsRemaining: 0,
  creditsMax: 0,
  accessState: null,
  accessReason: null,
  setWalletConnected: (next) =>
    set((state) => ({ walletConnected: resolveUpdater(next, state.walletConnected) })),
  setWalletAddress: (next) =>
    set((state) => ({ walletAddress: resolveUpdater(next, state.walletAddress) })),
  setBetaUserId: (next) =>
    set((state) => ({ betaUserId: resolveUpdater(next, state.betaUserId) })),
  setBetaStatus: (next) =>
    set((state) => ({ betaStatus: resolveUpdater(next, state.betaStatus) })),
  setCreditsRemaining: (next) =>
    set((state) => ({ creditsRemaining: resolveUpdater(next, state.creditsRemaining) })),
  setCreditsMax: (next) =>
    set((state) => ({ creditsMax: resolveUpdater(next, state.creditsMax) })),
  setAccessState: (next) =>
    set((state) => ({ accessState: resolveUpdater(next, state.accessState) })),
  setAccessReason: (next) =>
    set((state) => ({ accessReason: resolveUpdater(next, state.accessReason) })),
})
