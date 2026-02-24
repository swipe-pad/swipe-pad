import type { AppSliceCreator } from "@/store/app/slices/utils"
import { resolveUpdater } from "@/store/app/slices/utils"
import type { AppStore } from "@/store/app/types"

type UserSlice = Pick<
  AppStore,
  "userProfile" | "setUserProfile" | "userStats" | "setUserStats" | "userBalance" | "setUserBalance"
>

const initialUserProfile: AppStore["userProfile"] = {
  name: "MiniPay User",
  image:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  farcaster: "lenaprofile",
  lens: "lena.lens",
  zora: "lena.zora",
  twitter: "lenaprofile",
  nounsHeld: 2,
  lilNounsHeld: 5,
  totalSwipes: 47,
  projectsReported: 3,
  totalDonated: 125.75,
  poaps: 12,
  paragraphs: 5,
  ens: "lena.eth",
  discord: "lena#1234",
}

const initialUserStats: AppStore["userStats"] = {
  totalDonations: 0,
  categoriesSupported: new Set<string>(),
  streak: 0,
  lastDonation: null,
}

const initialUserBalance: AppStore["userBalance"] = {
  cUSD: 125.75,
  cEUR: 50.2,
  cGBP: 75.5,
  cAUD: 95.3,
  cCHF: 110.8,
  cCAD: 85.4,
  cKES: 1250,
  cREAL: 520.6,
  cZAR: 1850.2,
  cCOL: 425000,
  cJPY: 15500,
  USDC: 150,
  USDT: 150,
}

export const createUserSlice: AppSliceCreator<UserSlice> = (set) => ({
  userProfile: initialUserProfile,
  userStats: initialUserStats,
  userBalance: initialUserBalance,
  setUserProfile: (next) =>
    set((state) => ({ userProfile: resolveUpdater(next, state.userProfile) })),
  setUserStats: (next) =>
    set((state) => ({ userStats: resolveUpdater(next, state.userStats) })),
  setUserBalance: (next) =>
    set((state) => ({ userBalance: resolveUpdater(next, state.userBalance) })),
})
