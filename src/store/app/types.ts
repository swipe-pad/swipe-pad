import type { DonationAmount, StableCoin, ConfirmSwipes } from "@/components/amount-selector"

export type UserStats = {
  totalDonations: number
  categoriesSupported: Set<string>
  streak: number
  lastDonation: Date | null
}

export type UserProfile = {
  name?: string
  image?: string
  farcaster?: string
  lens?: string
  zora?: string
  twitter?: string
  nounsHeld?: number
  lilNounsHeld?: number
  totalSwipes: number
  projectsReported?: number
  totalDonated: number
  poaps?: number
  paragraphs?: number
  ens?: string
  discord?: string
  [key: string]: unknown
}

export type UserBalance = Record<string, number>

export type CartItem = {
  project: unknown
  amount: number
  currency: string
  message?: string
}

export type BetaStatus = "guest" | "pending" | "approved" | "active" | "rejected" | null

export type AppStateUpdater<T> = T | ((previous: T) => T)

export type Setter<T> = (next: AppStateUpdater<T>) => void

export type AccessState = "checking" | "denied" | "allowed" | "invite_required" | null

export type AppState = {
  userProfile: UserProfile
  userStats: UserStats
  userBalance: UserBalance
  cart: CartItem[]
  donationAmount: DonationAmount | null
  donationCurrency: StableCoin
  confirmSwipes: ConfirmSwipes
  swipeCount: number
  selectedCategory: string
  currentProjectIndex: number
  walletConnected: boolean
  walletAddress: string | null
  betaUserId: string | null
  betaStatus: BetaStatus
  creditsRemaining: number
  creditsMax: number
  hasCompletedOnboarding: boolean
  hasLoadedOnboardingState: boolean
  accessState: AccessState
  accessReason: string | null
}

export type AppActions = {
  setUserProfile: Setter<UserProfile>
  setUserStats: Setter<UserStats>
  setUserBalance: Setter<UserBalance>
  setCart: Setter<CartItem[]>
  setDonationAmount: Setter<DonationAmount | null>
  setDonationCurrency: Setter<StableCoin>
  setConfirmSwipes: Setter<ConfirmSwipes>
  setSwipeCount: Setter<number>
  setSelectedCategory: Setter<string>
  setCurrentProjectIndex: Setter<number>
  setWalletConnected: Setter<boolean>
  setWalletAddress: Setter<string | null>
  setBetaUserId: Setter<string | null>
  setBetaStatus: Setter<BetaStatus>
  setCreditsRemaining: Setter<number>
  setCreditsMax: Setter<number>
  setHasCompletedOnboarding: Setter<boolean>
  hydrateOnboardingState: () => void
  setAccessState: Setter<AccessState>
  setAccessReason: Setter<string | null>
}

export type AppStore = AppState & AppActions
