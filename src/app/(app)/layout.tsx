"use client"

import { useApp } from "@/context/AppContext"
import { StarryBackground } from "@/components/starry-background"
import { MobileMockup } from "@/components/mobile-mockup"
import { useMobile } from "@/hooks/use-mobile"
import { WalletConnect } from "@/components/wallet-connect"
import { ChevronDownIcon, RegisterIcon, TrendingIcon, CartIcon } from "@/components/icons"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cart } from "@/components/cart"
import { SuccessScreen } from "@/components/success-screen"
import { BadgeNotification } from "@/components/badge-notification"
import { ProfileQuickView } from "@/components/profile-quick-view"
import { EditProfile } from "@/components/edit-profile"
import { ProjectRegistrationForm } from "@/components/project-registration-form"
import { BetaBanner } from "@/components/beta-banner"
import { useEffect, useState } from "react"
import { useProjects } from "@/lib/useConvexData"
import { useActiveAccount } from "thirdweb/react"
import { useAccount as useWagmiAccount } from "wagmi"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobile()
    const pathname = usePathname()
    const projects = useProjects()
    const thirdwebAccount = useActiveAccount()
    const { address: wagmiAddress } = useWagmiAccount()
    const ensureGuestUser = useMutation(api.waitlist.ensureGuestUser)
    const {
        walletConnected, setWalletConnected,
        walletAddress, setWalletAddress,
        betaUserId, setBetaUserId,
        betaStatus, setBetaStatus,
        creditsRemaining, setCreditsRemaining,
        creditsMax, setCreditsMax,
        hasCompletedOnboarding, setHasCompletedOnboarding,
        userProfile, setUserProfile,
        userStats,
        userBalance,
        cart, setCart,
        donationAmount, setDonationAmount,
        donationCurrency,
    } = useApp()

    const [showCart, setShowCart] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [showBadgeNotification, setShowBadgeNotification] = useState(false)
    const [currentBadge, setCurrentBadge] = useState("")
    const [showProfileQuickView, setShowProfileQuickView] = useState(false)
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [showRegistrationForm, setShowRegistrationForm] = useState(false)

    const ENABLE_PROJECT_REGISTRATION = false

    useEffect(() => {
        const nextAddress = thirdwebAccount?.address ?? wagmiAddress ?? null
        setWalletAddress(nextAddress)
    }, [thirdwebAccount?.address, wagmiAddress, setWalletAddress])

    useEffect(() => {
        const address = walletAddress
        if (!walletConnected || !address) return
        let isMounted = true

        ensureGuestUser({ wallet: address, chain: "celo" })
            .then((result) => {
                if (!isMounted) return
                setBetaUserId(result.userId)
                setBetaStatus(result.status)
                setCreditsRemaining(result.remaining)
                setCreditsMax(result.max)
            })
            .catch((error) => {
                console.error("Failed to initialize beta user:", error)
            })

        return () => {
            isMounted = false
        }
    }, [walletConnected, walletAddress, ensureGuestUser, setBetaUserId, setBetaStatus, setCreditsRemaining, setCreditsMax])

    if (isMobile === undefined) {
        return (
            <main className="
              flex min-h-screen items-center justify-center bg-black
            ">
                <StarryBackground />
            </main>
        )
    }

    const renderPageContainer = (children: React.ReactNode) => {
        if (isMobile) {
            return <div className="
              relative z-10 flex h-screen w-full flex-col overflow-hidden
            ">{children}</div>
        }
        return <MobileMockup>{children}</MobileMockup>
    }

    if (!hasCompletedOnboarding) {
        return (
            <main className="
              relative flex min-h-screen flex-col items-center justify-center
              overflow-hidden text-white
            ">
                <StarryBackground />
                {renderPageContainer(
                    <OnboardingWizard onComplete={() => setHasCompletedOnboarding(true)} />
                )}
            </main>
        )
    }

    if (!walletConnected) {
        return (
            <main className="
              relative flex min-h-screen flex-col items-center justify-center
              overflow-hidden text-white
            ">
                <StarryBackground />
                {renderPageContainer(
                    <WalletConnect onConnect={() => setWalletConnected(true)} />
                )}
            </main>
        )
    }

    const handleCheckout = () => {
        setShowCart(false)
        setShowSuccess(true)
        setCart([])
    }

    return (
        <main className="
          relative flex min-h-screen flex-col items-center justify-center
          overflow-hidden text-white
        ">
            <StarryBackground />

            {renderPageContainer(
                <>
                    <div className="
                      app-content-wrapper flex size-full flex-col
                      overflow-hidden
                    ">
                    {/* Header */}
                    <header className="
                      view-header sticky top-0 z-40 border-b border-gray-800/50
                      bg-gray-900/60 backdrop-blur-xl
                    ">
                        <div className="flex flex-col items-center py-3">
                            <div className="
                              mb-3 flex w-full items-center justify-between px-6
                            ">
                                <div className="w-8"></div>
                                <div className="flex flex-1 justify-center">
                                    <Link href="/swipe">
                                        <h1
                                            className="
                                              cursor-pointer text-center text-lg
                                              font-bold text-white
                                              transition-colors
                                              hover:text-[#FFD600]
                                            "
                                            style={{ fontFamily: "Pixelify Sans, monospace" }}
                                        >
                                            SwipePad
                                        </h1>
                                    </Link>
                                </div>
                                {ENABLE_PROJECT_REGISTRATION ? (
                                    <button
                                        onClick={() => setShowRegistrationForm(true)}
                                        className="
                                          flex size-8 items-center
                                          justify-center rounded-full
                                          bg-[#677FEB] text-white shadow-lg
                                          shadow-[#677FEB]/20 transition-colors
                                          hover:bg-[#5A6FD3]
                                        "
                                    >
                                        <RegisterIcon />
                                    </button>
                                ) : (
                                    <div className="w-8" />
                                )}
                            </div>

                            {/* Beta Banner */}
                            <div className="mb-3 px-6">
                                <BetaBanner chain="celo" />
                            </div>

                            {donationAmount && (
                                <div className="
                                  mb-4 flex items-center rounded-full border
                                  border-gray-700/50 bg-gray-800/40 px-4 py-1
                                  backdrop-blur-md
                                ">
                                    <span className="
                                      mr-1 text-base font-bold text-[#FFD600]
                                    ">{userBalance[donationCurrency]}</span>
                                    <span className="mr-1 text-sm text-gray-400">{donationCurrency}</span>
                                    <button className="
                                      text-gray-400
                                      hover:text-white
                                    ">
                                        <ChevronDownIcon />
                                    </button>
                                </div>
                            )}

                            <nav className="
                              flex w-full justify-between space-x-2 px-6
                            ">
                                <button
                                    className="
                                      relative flex size-12 items-center
                                      justify-center rounded-full
                                      transition-transform
                                      hover:scale-105
                                    "
                                    onClick={() => setShowEditProfile(true)}
                                >
                                    <img
                                        src={userProfile.image || "/placeholder.svg"}
                                        alt="Profile"
                                        className="
                                          size-12 rounded-full border-2
                                          border-gray-800 object-cover shadow-xl
                                        "
                                    />
                                </button>
                                <Link
                                    href="/trending"
                                    className={`
                                      flex size-12 items-center justify-center
                                      rounded-full transition-all
                                      ${pathname === '/trending' ? `
                                        bg-[#FFD600] text-black shadow-lg
                                        shadow-[#FFD600]/20
                                      ` : `
                                        bg-gray-800/50 text-white
                                        hover:bg-gray-700
                                      `}
                                    `}
                                >
                                    <TrendingIcon />
                                </Link>
                                <button
                                    className="
                                      relative flex size-12 items-center
                                      justify-center rounded-full bg-[#677FEB]
                                      shadow-lg shadow-[#677FEB]/30
                                      transition-colors
                                      hover:bg-[#5A6FD3]
                                    "
                                    onClick={() => setShowCart(true)}
                                >
                                    <CartIcon />
                                    {cart.length > 0 && (
                                        <span className="
                                          absolute -top-1 -right-1 flex size-5
                                          animate-bounce items-center
                                          justify-center rounded-full
                                          bg-[#FFD600] text-xs font-bold
                                          text-black
                                        ">
                                            {cart.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </header>

                    <div className="
                      view-content custom-scrollbar flex-1 overflow-y-auto
                    ">
                        {children}
                    </div>
                </div>

                {/* Modals */}
                {showCart && <Cart items={cart} onClose={() => setShowCart(false)} onCheckout={handleCheckout} />}
                {showSuccess && (
                    <SuccessScreen
                        onClose={() => setShowSuccess(false)}
                        categories={[...new Set(cart.map((item: any) => item.project.category))]}
                    />
                )}
                {showBadgeNotification && (
                    <BadgeNotification badge={currentBadge} onClose={() => setShowBadgeNotification(false)} />
                )}
                <ProfileQuickView
                    isOpen={showProfileQuickView}
                    onClose={() => setShowProfileQuickView(false)}
                    userStats={userStats}
                    recentDonations={cart.slice(0, 5).map((item: any) => ({ ...item, date: new Date() }))}
                    savedProjects={projects.slice(0, 3)}
                />
                <EditProfile
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSave={(data) => setUserProfile((prev: any) => ({ ...prev, ...data }))}
                    currentProfile={userProfile}
                />
                    {ENABLE_PROJECT_REGISTRATION && (
                        <ProjectRegistrationForm
                            isOpen={showRegistrationForm}
                            onClose={() => setShowRegistrationForm(false)}
                            onSubmit={(data) => console.log(data)}
                        />
                    )}
                </>
            )}
        </main>
    )
}
