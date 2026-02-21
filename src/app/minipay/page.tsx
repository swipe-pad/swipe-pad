"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { ToggleMenu } from "@/components/toggle-menu"
import { CategoryMenu } from "@/components/category-menu"
import { ProjectCard } from "@/components/project-card"
import { Cart } from "@/components/cart"
import { SuccessScreen } from "@/components/success-screen"
import { MiniPayWalletConnect } from "@/components/minipay-wallet-connect"
import { AmountSelector, type DonationAmount, type StableCoin, type ConfirmSwipes } from "@/components/amount-selector"
import { useProjects, useCategories } from "@/lib/useConvexData"
import { StarryBackground } from "@/components/starry-background"
import { MobileMockup } from "@/components/mobile-mockup"
import { useMobile } from "@/hooks/use-mobile"
import { EditProfile } from "@/components/edit-profile"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"

export default function MiniPayApp() {
  const { isConnected, address } = useAccount()
  const projects = useProjects()
  const categories = useCategories()
  const ensureGuestUser = useMutation(api.waitlist.ensureGuestUser)
  const consumeCredits = useMutation(api.waitlist.consumeCredits)
  const recordSwipe = useMutation(api.waitlist.recordSwipe)
  const [viewMode, setViewMode] = useState<"swipe" | "list" | "profile" | "trending">("swipe")
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "Eco Projects")
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const [cart, setCart] = useState<Array<{ project: any; amount: number; currency: StableCoin; message?: string }>>([])
  const [showCart, setShowCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [donationAmount, setDonationAmount] = useState<DonationAmount | null>(null)
  const [donationCurrency, setDonationCurrency] = useState<StableCoin>("cUSD")
  const [confirmSwipes, setConfirmSwipes] = useState<ConfirmSwipes>(20)
  const [showBadgeNotification, setShowBadgeNotification] = useState(false)
  const [currentBadge, setCurrentBadge] = useState("")
  const [swipeCount, setSwipeCount] = useState(0)
  const [showProfileQuickView, setShowProfileQuickView] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [userStats, setUserStats] = useState({
    totalDonations: 0,
    categoriesSupported: new Set<string>(),
    streak: 0,
    lastDonation: null as Date | null,
  })
  const [userProfile, setUserProfile] = useState({
    name: "MiniPay User",
    image: "/placeholder.svg",
    farcaster: "",
    lens: "",
    zora: "",
    twitter: "",
    discord: "",
    ens: "",
    poaps: 10,
    lilNounsHeld: 8,
    nounsHeld: 0,
    paragraphs: 0,
    totalSwipes: 47,
    projectsReported: 3,
    totalDonated: 125.75,
  })
  const [userBalance, setUserBalance] = useState({
    cUSD: 125.75,
    USDC: 50.2,
    USDT: 75.5,
  })
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [shownBadges, setShownBadges] = useState<Set<string>>(new Set())
  const [betaUserId, setBetaUserId] = useState<string | null>(null)
  const [betaStatus, setBetaStatus] = useState<"guest" | "pending" | "approved" | "active" | "rejected" | null>(null)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [creditsMax, setCreditsMax] = useState(0)

  const filteredProjects = projects.filter((project) => project.category === selectedCategory)

  const canSwipe = (betaStatus === "active" || betaStatus === "guest") && creditsRemaining > 0

  useEffect(() => {
    if (!isConnected || !address) return
    let isMounted = true

    ensureGuestUser({ wallet: address, chain: "celo" })
      .then((result) => {
        if (!isMounted) return
        setBetaUserId(result.userId)
        setBetaStatus(result.status)
        setCreditsRemaining(result.remaining)
        setCreditsMax(result.max)
      })
      .catch((error) => console.error("Failed to initialize beta user:", error))

    return () => {
      isMounted = false
    }
  }, [isConnected, address, ensureGuestUser])

  const handleSwipeRight = () => {
    if (donationAmount === null) return
    if (!canSwipe || !betaUserId) return

    const project = filteredProjects[currentProjectIndex]

    consumeCredits({ userId: betaUserId as Id<"waitlistUsers">, chain: "celo", amount: 1 })
      .then((result) => setCreditsRemaining(result.remaining))
      .catch((error) => {
        console.error("Failed to consume credits:", error)
      })

    recordSwipe({
      userId: betaUserId as Id<"waitlistUsers">,
      projectId: project.projectId,
      direction: "right",
      amount: Number.parseFloat(donationAmount.split(" ")[0]),
    }).catch((error) => console.error("Failed to record swipe:", error))

    setUserStats((prev) => {
      const categoriesSupported = new Set(prev.categoriesSupported)
      categoriesSupported.add(project.category)

      return {
        totalDonations: prev.totalDonations + 1,
        categoriesSupported,
        streak: prev.lastDonation ? prev.streak + 1 : 1,
        lastDonation: new Date(),
      }
    })

    setUserProfile((prev) => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
      totalDonated: prev.totalDonated + Number.parseFloat(donationAmount.split(" ")[0]),
    }))

    const newCart = [...cart, { project, amount: Number.parseFloat(donationAmount.split(" ")[0]), currency: donationCurrency }]
    setCart(newCart)

    const newSwipeCount = swipeCount + 1
    setSwipeCount(newSwipeCount)

    if (newSwipeCount >= confirmSwipes) {
      setShowSuccess(true)
      setSwipeCount(0)
    }

    if (currentProjectIndex < filteredProjects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1)
    } else {
      setCurrentProjectIndex(0)
    }
  }

  const handleSwipeLeft = () => {
    setUserProfile((prev) => ({
      ...prev,
      totalSwipes: prev.totalSwipes + 1,
    }))

    if (betaUserId) {
      recordSwipe({
        userId: betaUserId as Id<"waitlistUsers">,
        projectId: filteredProjects[currentProjectIndex]?.projectId ?? "",
        direction: "left",
      }).catch((error) => console.error("Failed to record swipe:", error))
    }

    if (currentProjectIndex < filteredProjects.length - 1) {
      setCurrentProjectIndex(currentProjectIndex + 1)
    } else {
      setCurrentProjectIndex(0)
    }
  }

  const handleAmountSelect = (amount: DonationAmount, currency: StableCoin, swipes: ConfirmSwipes) => {
    setDonationAmount(amount)
    setDonationCurrency(currency)
    setConfirmSwipes(swipes)
    setSwipeCount(0)
  }

  const handleCheckout = async () => {
    setShowCart(false)
    setShowSuccess(true)
    setCart([])
    setSwipeCount(0)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
  }

  const AppContent = () => (
    <div className="flex size-full flex-col overflow-hidden">
      {!isConnected ? (
        <MiniPayWalletConnect onConnect={() => { }} />
      ) : (
        <>
          <div className="
            sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95
            backdrop-blur-sm
          ">
            <div className="flex flex-col items-center py-3">
              <h1
                className="mb-4 text-center text-lg font-bold text-white"
                style={{ fontFamily: "Pixelify Sans, monospace" }}
              >
                SwipePad for MiniPay
              </h1>

              {isConnected && donationAmount && (
                <div className="
                  mb-4 flex items-center rounded-full bg-transparent px-4 py-1
                ">
                  <span className="mr-1 text-base font-bold text-[#FFD600]">{userBalance[donationCurrency]}</span>
                  <span className="text-sm text-gray-400">{donationCurrency}</span>
                </div>
              )}

              {!canSwipe ? (
                <div className="
                  mx-6 mb-3 w-full rounded-lg border border-yellow-500/30
                  bg-yellow-500/10 px-3 py-2 text-xs text-yellow-100
                ">
                  You have no swipes left. Keep browsing or create an account to unlock more.
                </div>
              ) : (
                <div className="
                  mx-6 mb-3 w-full text-right text-xs text-gray-400 italic
                ">
                  {creditsRemaining}/{creditsMax} swipes left
                </div>
              )}

              <div className="flex w-full justify-between space-x-2 px-6">
                <button
                  className="
                    flex size-12 items-center justify-center rounded-full
                  "
                  onClick={() => setShowEditProfile(true)}
                >
                  <img
                    src={userProfile.image || "/placeholder.svg"}
                    alt="Profile"
                    className="size-12 rounded-full object-cover"
                  />
                </button>
                <button
                  className="
                    relative flex size-12 items-center justify-center
                    rounded-full bg-[#677FEB]
                  "
                  onClick={() => setShowCart(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="
                      absolute -top-1 -right-1 flex size-5 items-center
                      justify-center rounded-full bg-[#FFD600] text-xs font-bold
                      text-black
                    ">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="py-6">
              <ToggleMenu
                viewMode={viewMode === "swipe" ? "swipe" : "list"}
                setViewMode={(mode) => setViewMode(mode)}
              />

              {viewMode === "swipe" ? (
                <>
                  {donationAmount === null ? (
                    <AmountSelector onSelect={handleAmountSelect} availableProjects={filteredProjects.length} />
                  ) : (
                    <>
                      <CategoryMenu
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        setCurrentProjectIndex={() => setCurrentProjectIndex(0)}
                      />

                      <div className="mb-2 px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-gray-300">Donating: </span>
                            <span className="font-bold text-[#FFD600]">
                              {donationAmount} {donationCurrency}
                            </span>
                          </div>
                          <button
                            onClick={() => setDonationAmount(null)}
                            className="
                              text-sm text-gray-300 underline
                              hover:text-white
                            "
                          >
                            Change
                          </button>
                        </div>
                        <div className="mt-2 rounded-lg bg-gray-800 p-2">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Swipes until confirmation:</span>
                            <span>{confirmSwipes - swipeCount} more</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-700">
                            <div
                              className="
                                h-2 rounded-full bg-[#FFD600] transition-all
                                duration-300
                              "
                              style={{ width: `${(swipeCount / confirmSwipes) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="px-6">
                        {filteredProjects.length > 0 && (
                          <ProjectCard
                            project={filteredProjects[currentProjectIndex]}
                            onSwipeLeft={handleSwipeLeft}
                            onSwipeRight={canSwipe ? handleSwipeRight : undefined}
                            viewMode="swipe"
                            donationAmount={donationAmount}
                            donationCurrency={donationCurrency}
                            onBoost={(amount) => { }}
                          />
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </>
      )}

      {showCart && <Cart items={cart} onClose={() => setShowCart(false)} onCheckout={handleCheckout} />}
      {showSuccess && (
        <SuccessScreen
          onClose={handleSuccessClose}
          categories={[...new Set(cart.map((item) => item.project.category))]}
        />
      )}
      {showEditProfile && (
        <EditProfile
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          onSave={(data) => setUserProfile((prev) => ({ ...prev, ...data }))}
          currentProfile={userProfile}
        />
      )}
    </div>
  )

  const isMobile = useMobile()

  // During SSR, render a loading state to avoid hydration mismatch
  if (isMobile === undefined) {
    return (
      <main className="
        relative flex min-h-screen w-full flex-col items-center justify-center
        overflow-hidden bg-gray-900 text-white
      ">
        <StarryBackground />
      </main>
    )
  }

  return (
    <main className="
      relative flex min-h-screen w-full flex-col items-center overflow-hidden
      bg-gray-900 text-white
    ">
      <StarryBackground />

      {isMobile ? (
        <div className="relative z-10 h-screen w-full">
          <AppContent />
        </div>
      ) : (
        <MobileMockup>
          <AppContent />
        </MobileMockup>
      )}
    </main>
  )
}
