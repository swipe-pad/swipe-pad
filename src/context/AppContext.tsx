"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { DonationAmount, StableCoin, ConfirmSwipes } from "@/components/amount-selector"

type UserStats = {
    totalDonations: number
    categoriesSupported: Set<string>
    streak: number
    lastDonation: Date | null
}

type UserProfile = {
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

type UserBalance = Record<string, number>

type CartItem = {
    project: unknown
    amount: number
    currency: string
    message?: string
}

interface AppContextType {
    userProfile: UserProfile
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>
    userStats: UserStats
    setUserStats: React.Dispatch<React.SetStateAction<UserStats>>
    userBalance: UserBalance
    setUserBalance: React.Dispatch<React.SetStateAction<UserBalance>>
    cart: CartItem[]
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
    donationAmount: DonationAmount | null
    setDonationAmount: React.Dispatch<React.SetStateAction<DonationAmount | null>>
    donationCurrency: StableCoin
    setDonationCurrency: React.Dispatch<React.SetStateAction<StableCoin>>
    confirmSwipes: ConfirmSwipes
    setConfirmSwipes: React.Dispatch<React.SetStateAction<ConfirmSwipes>>
    swipeCount: number
    setSwipeCount: React.Dispatch<React.SetStateAction<number>>
    selectedCategory: string
    setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
    currentProjectIndex: number
    setCurrentProjectIndex: React.Dispatch<React.SetStateAction<number>>
    walletConnected: boolean
    setWalletConnected: React.Dispatch<React.SetStateAction<boolean>>
    walletAddress: string | null
    setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>
    betaUserId: string | null
    setBetaUserId: React.Dispatch<React.SetStateAction<string | null>>
    betaStatus: "guest" | "pending" | "approved" | "active" | "rejected" | null
    setBetaStatus: React.Dispatch<React.SetStateAction<"guest" | "pending" | "approved" | "active" | "rejected" | null>>
    creditsRemaining: number
    setCreditsRemaining: React.Dispatch<React.SetStateAction<number>>
    creditsMax: number
    setCreditsMax: React.Dispatch<React.SetStateAction<number>>
    hasCompletedOnboarding: boolean
    setHasCompletedOnboarding: React.Dispatch<React.SetStateAction<boolean>>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [walletConnected, setWalletConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [betaUserId, setBetaUserId] = useState<string | null>(null)
    const [betaStatus, setBetaStatus] = useState<"guest" | "pending" | "approved" | "active" | "rejected" | null>(null)
    const [creditsRemaining, setCreditsRemaining] = useState(0)
    const [creditsMax, setCreditsMax] = useState(0)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
    const [hasLoadedOnboardingState, setHasLoadedOnboardingState] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("Regeneration")
    const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
    const [cart, setCart] = useState<CartItem[]>([])
    const [donationAmount, setDonationAmount] = useState<DonationAmount | null>("0.01¢")
    const [donationCurrency, setDonationCurrency] = useState<StableCoin>("cUSD")
    const [confirmSwipes, setConfirmSwipes] = useState<ConfirmSwipes>(20)
    const [swipeCount, setSwipeCount] = useState(0)

    const [userStats, setUserStats] = useState({
        totalDonations: 0,
        categoriesSupported: new Set<string>(),
        streak: 0,
        lastDonation: null as Date | null,
    })

    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: "MiniPay User",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
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
    })

    const [userBalance, setUserBalance] = useState<UserBalance>({
        cUSD: 125.75,
        cEUR: 50.2,
        cGBP: 75.5,
        cAUD: 95.3,
        cCHF: 110.8,
        cCAD: 85.4,
        cKES: 1250.0,
        cREAL: 520.6,
        cZAR: 1850.2,
        cCOL: 425000.0,
        cJPY: 15500.0,
        USDC: 150.0,
        USDT: 150.0,
    })

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem("swipepad:onboarding-complete")
            if (stored === "1") {
                setHasCompletedOnboarding(true)
            }
        } catch (error) {
            console.error("Failed to read onboarding state:", error)
        } finally {
            setHasLoadedOnboardingState(true)
        }
    }, [])

    useEffect(() => {
        if (!hasLoadedOnboardingState) return

        try {
            window.localStorage.setItem("swipepad:onboarding-complete", hasCompletedOnboarding ? "1" : "0")
        } catch (error) {
            console.error("Failed to persist onboarding state:", error)
        }
    }, [hasCompletedOnboarding, hasLoadedOnboardingState])

    return (
        <AppContext.Provider
            value={{
                userProfile, setUserProfile,
                userStats, setUserStats,
                userBalance, setUserBalance,
                cart, setCart,
                donationAmount, setDonationAmount,
                donationCurrency, setDonationCurrency,
                confirmSwipes, setConfirmSwipes,
                swipeCount, setSwipeCount,
                selectedCategory, setSelectedCategory,
                currentProjectIndex, setCurrentProjectIndex,
                walletConnected, setWalletConnected,
                walletAddress, setWalletAddress,
                betaUserId, setBetaUserId,
                betaStatus, setBetaStatus,
                creditsRemaining, setCreditsRemaining,
                creditsMax, setCreditsMax,
                hasCompletedOnboarding, setHasCompletedOnboarding,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider")
    }
    return context
}
