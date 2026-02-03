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
import { useState } from "react"
import { projects } from "@/lib/data"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const isMobile = useMobile()
    const pathname = usePathname()
    const {
        walletConnected, setWalletConnected,
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

    if (isMobile === undefined) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-black">
                <StarryBackground />
            </main>
        )
    }

    const PageContainer = ({ children }: { children: React.ReactNode }) => {
        if (isMobile) {
            return <div className="relative z-10 w-full h-screen flex flex-col overflow-hidden">{children}</div>
        }
        return <MobileMockup>{children}</MobileMockup>
    }

    if (!walletConnected) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center text-white relative overflow-hidden bg-black">
                <StarryBackground />
                <PageContainer>
                    <WalletConnect onConnect={() => setWalletConnected(true)} />
                </PageContainer>
            </main>
        )
    }

    const handleCheckout = () => {
        setShowCart(false)
        setShowSuccess(true)
        setCart([])
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center text-white relative overflow-hidden bg-black">
            <StarryBackground />

            <PageContainer>
                <div className="w-full h-full flex flex-col overflow-hidden app-content-wrapper">
                    {/* Header */}
                    <header className="sticky top-0 z-40 bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/50 view-header">
                        <div className="flex flex-col items-center py-3">
                            <div className="flex items-center justify-between w-full mb-4 px-6">
                                <div className="w-8"></div>
                                <div className="flex-1 flex justify-center">
                                    <Link href="/swipe">
                                        <h1
                                            className="text-lg font-bold text-center text-white cursor-pointer hover:text-[#FFD600] transition-colors"
                                            style={{ fontFamily: "Pixelify Sans, monospace" }}
                                        >
                                            SwipePad
                                        </h1>
                                    </Link>
                                </div>
                                <button
                                    onClick={() => setShowRegistrationForm(true)}
                                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#677FEB] text-white hover:bg-[#5A6FD3] transition-colors shadow-lg shadow-[#677FEB]/20"
                                >
                                    <RegisterIcon />
                                </button>
                            </div>

                            {donationAmount && (
                                <div className="bg-gray-800/40 backdrop-blur-md rounded-full px-4 py-1 mb-4 flex items-center border border-gray-700/50">
                                    <span className="text-[#FFD600] font-bold text-base mr-1">{userBalance[donationCurrency]}</span>
                                    <span className="text-gray-400 text-sm mr-1">{donationCurrency}</span>
                                    <button className="text-gray-400 hover:text-white">
                                        <ChevronDownIcon />
                                    </button>
                                </div>
                            )}

                            <nav className="flex justify-between w-full px-6 space-x-2">
                                <button
                                    className="flex items-center justify-center w-12 h-12 rounded-full relative hover:scale-105 transition-transform"
                                    onClick={() => setShowProfileQuickView(true)}
                                >
                                    <img
                                        src={userProfile.image || "/placeholder.svg"}
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-800 shadow-xl"
                                    />
                                </button>
                                <Link
                                    href="/trending"
                                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${pathname === '/trending' ? 'bg-[#FFD600] text-black shadow-lg shadow-[#FFD600]/20' : 'bg-gray-800/50 text-white hover:bg-gray-700'}`}
                                >
                                    <TrendingIcon />
                                </Link>
                                <button
                                    className="flex items-center justify-center w-12 h-12 rounded-full bg-[#677FEB] relative hover:bg-[#5A6FD3] transition-colors shadow-lg shadow-[#677FEB]/30"
                                    onClick={() => setShowCart(true)}
                                >
                                    <CartIcon />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-[#FFD600] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                                            {cart.length}
                                        </span>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto view-content custom-scrollbar">
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
                <ProjectRegistrationForm
                    isOpen={showRegistrationForm}
                    onClose={() => setShowRegistrationForm(false)}
                    onSubmit={(data) => console.log(data)}
                />
            </PageContainer>
        </main>
    )
}
