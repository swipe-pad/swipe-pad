"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Star, Clock, Award, Compass, Gift, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDisconnect as useThirdwebDisconnect, useActiveWallet } from "thirdweb/react"
import { useDisconnect as useWagmiDisconnect } from "wagmi"
import { useApp } from "@/context/AppContext"
import type { Project } from "@/lib/useConvexData"

interface ProfileQuickViewProps {
  isOpen: boolean
  onClose: () => void
  userStats: {
    totalDonations: number
    categoriesSupported: Set<string>
    streak: number
    lastDonation: Date | null
  }
  recentDonations?: Array<{
    project: Project
    amount: number
    currency: string
    date: Date
  }>
  savedProjects?: Project[]
}

export function ProfileQuickView({
  isOpen,
  onClose,
  userStats,
  recentDonations = [],
  savedProjects = [],
}: ProfileQuickViewProps) {
  const [activeTab, setActiveTab] = useState<"favorites" | "history" | "badges" | "categories" | "rewards">("history")
  const [startY, setStartY] = useState<number | null>(null)
  const [currentY, setCurrentY] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const { disconnect: disconnectThirdweb } = useThirdwebDisconnect()
  const activeWallet = useActiveWallet()
  const { disconnect: disconnectWagmi } = useWagmiDisconnect()
  const { setWalletConnected } = useApp()

  const handleLogout = () => {
    if (activeWallet) {
      disconnectThirdweb(activeWallet)
    }
    disconnectWagmi()
    setWalletConnected(false)
    onClose()
  }

  // Handle swipe down to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    if (startY === null || currentY === null) return

    // If swiped down more than 100px, close the modal
    if (currentY - startY > 100) {
      onClose()
    }

    setStartY(null)
    setCurrentY(null)
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Mock badges data
  const userBadges = [
    {
      id: "first-swipe",
      name: "First Swipe",
      description: "Made your first donation",
      earned: userStats.totalDonations > 0,
    },
    { id: "streak-5", name: "5-Day Streak", description: "Donated for 5 days in a row", earned: userStats.streak >= 5 },
    {
      id: "category-champion",
      name: "Category Champion",
      description: "Supported 3+ different categories",
      earned: userStats.categoriesSupported.size >= 3,
    },
    {
      id: "top-swiper",
      name: "Top Swiper",
      description: "Among top donors this week",
      earned: userStats.totalDonations > 10,
    },
  ]

  // Get top 3 categories
  const topCategories = Array.from(userStats.categoriesSupported).slice(0, 3)

  // Calculate offset for swipe animation
  const offset = currentY && startY ? Math.max(0, currentY - startY) : 0

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/60 transition-opacity duration-300",
        isOpen ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div
        ref={modalRef}
        className={cn(
          `
            fixed inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-2xl
            bg-[#1F2732] shadow-xl transition-transform duration-300
          `,
          isOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{ transform: `translateY(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex w-full justify-center pt-2 pb-4">
          <div className="h-1 w-12 rounded-full bg-gray-600"></div>
        </div>

        {/* Header with close button and logout */}
        <div className="mb-4 flex items-center justify-between px-5">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Your Profile</h2>
            <button
              onClick={handleLogout}
              className="
                flex items-center space-x-1 rounded-md border border-red-500/20
                bg-red-500/10 px-2 py-1 text-xs text-red-400 transition-colors
                hover:bg-red-500/20
              "
            >
              <LogOut className="size-3" />
              <span>Log out</span>
            </button>
          </div>
          <button onClick={onClose} className="rounded-full bg-gray-800 p-1">
            <X className="size-5" />
          </button>
        </div>

        {/* User info */}
        <div className="mb-6 flex items-center px-5">
          <div className="
            mr-4 flex size-16 items-center justify-center rounded-full
            bg-gray-700
          ">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">MiniPay User</h3>
            <div className="mt-1 flex space-x-3">
              <div className="rounded-full bg-gray-800 px-2 py-1 text-sm">
                <span className="text-gray-400">Donations:</span> {userStats.totalDonations}
              </div>
              <div className="rounded-full bg-gray-800 px-2 py-1 text-sm">
                <span className="text-gray-400">Streak:</span> {userStats.streak}d
              </div>
            </div>
          </div>
        </div>

        {/* Balance display */}
        <div className="mb-6 px-5">
          <h4 className="mb-2 text-sm text-gray-400 uppercase">Your Balance</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-[#FFD600]">125.75</p>
              <p className="text-xs text-gray-400">cUSD</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-[#FFD600]">50.20</p>
              <p className="text-xs text-gray-400">cEUR</p>
            </div>
            <div className="rounded-lg bg-gray-800 p-3 text-center">
              <p className="text-lg font-bold text-[#FFD600]">75.50</p>
              <p className="text-xs text-gray-400">cOP</p>
            </div>
          </div>
        </div>

        {/* Navigation tabs - Now showing all 6 tabs */}
        <div className="
          scrollbar-hide mb-4 flex overflow-x-auto border-b border-gray-800 px-2
        ">
          <TabButton
            icon={<Clock className="mr-1 size-4" />}
            label="History"
            isActive={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
          <TabButton
            icon={<Star className="mr-1 size-4" />}
            label="Favorites"
            isActive={activeTab === "favorites"}
            onClick={() => setActiveTab("favorites")}
          />
          <TabButton
            icon={<Award className="mr-1 size-4" />}
            label="Badges"
            isActive={activeTab === "badges"}
            onClick={() => setActiveTab("badges")}
          />
          <TabButton
            icon={<Compass className="mr-1 size-4" />}
            label="Categories"
            isActive={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
          />
          <TabButton
            icon={<Gift className="mr-1 size-4" />}
            label="Rewards"
            isActive={activeTab === "rewards"}
            onClick={() => setActiveTab("rewards")}
          />
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(85vh - 180px)" }}>
          {activeTab === "history" && (
            <div>
              <h4 className="mb-3 text-sm text-gray-400 uppercase">Recent Activity</h4>
              {recentDonations.length > 0 ? (
                <div className="space-y-3">
                  {recentDonations.map((donation, index) => (
                    <div key={index} className="
                      flex items-center rounded-lg bg-gray-800 p-3
                    ">
                      <img
                        src={donation.project.imageUrl || "/placeholder.svg"}
                        alt={donation.project.name}
                        className="mr-3 size-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{donation.project.name}</p>
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-400">{donation.date.toLocaleDateString()}</span>
                          <span className="text-xs font-medium text-[#FFD600]">
                            {donation.amount} {donation.currency}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Clock className="mx-auto mb-2 size-12 opacity-50" />
                  <p>No donation history yet</p>
                  <p className="text-sm">Your recent donations will appear here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              <h4 className="mb-3 text-sm text-gray-400 uppercase">Saved Projects</h4>
              {savedProjects.length > 0 ? (
                <div className="space-y-3">
                  {savedProjects.map((project) => (
                    <div key={project.id} className="
                      flex items-center rounded-lg bg-gray-800 p-3
                    ">
                      <img
                        src={project.imageUrl || "/placeholder.svg"}
                        alt={project.name}
                        className="mr-3 size-12 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.category}</p>
                      </div>
                      <button className="
                        rounded-lg bg-[#677FEB] px-3 py-1 text-sm text-white
                        hover:bg-[#5A6FD3]
                      ">
                        Donate
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Star className="mx-auto mb-2 size-12 opacity-50" />
                  <p>No favorites yet</p>
                  <p className="text-sm">Bookmark projects to find them here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "badges" && (
            <div>
              <h4 className="mb-3 text-sm text-gray-400 uppercase">Your Achievements</h4>
              <div className="space-y-3">
                {userBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`
                      flex items-center rounded-lg p-3
                      ${badge.earned ? `bg-[#FFD600]/10` : `bg-gray-800`}
                    `}
                  >
                    <div
                      className={`
                        mr-3 flex size-10 items-center justify-center
                        rounded-full
                        ${badge.earned ? `bg-[#FFD600] text-black` : `
                          bg-gray-700 text-gray-500
                        `}
                      `}
                    >
                      <Award className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`
                        font-medium
                        ${badge.earned ? `text-[#FFD600]` : `text-gray-400`}
                      `}>{badge.name}</p>
                      <p className="text-xs text-gray-400">{badge.description}</p>
                    </div>
                    {badge.earned && <Award className="size-5 text-[#FFD600]" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div>
              <h4 className="mb-3 text-sm text-gray-400 uppercase">Categories You Support</h4>
              {topCategories.length > 0 ? (
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="rounded-lg bg-gray-800 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="font-medium">{category}</h5>
                        <span className="
                          rounded-full bg-[#677FEB]/20 px-2 py-1 text-xs
                          text-[#677FEB]
                        ">
                          {Math.floor(Math.random() * 5) + 1} projects
                        </span>
                      </div>
                      <div className="mb-1 h-2 w-full rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-[#677FEB]"
                          style={{ width: `${Math.floor(Math.random() * 60) + 40}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.floor(Math.random() * 30) + 10}% of your donations
                      </div>
                    </div>
                  ))}

                  <button className="
                    mt-2 w-full rounded-lg bg-gray-800 py-3 font-medium
                    text-white transition-colors
                    hover:bg-gray-700
                  ">
                    View All Categories
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Compass className="mx-auto mb-2 size-12 opacity-50" />
                  <p>No categories yet</p>
                  <p className="text-sm">Donate to projects to see categories here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <h4 className="mb-3 text-sm text-gray-400 uppercase">Your Impact Points</h4>

              <div className="mb-4 rounded-lg bg-gray-800 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="font-medium">Trust Score</h5>
                  <span className="text-lg font-bold text-[#FFD600]">
                    {userStats.totalDonations * 10 + userStats.streak * 5} pts
                  </span>
                </div>
                <div className="mb-2 h-3 w-full rounded-full bg-gray-700">
                  <div
                    className="
                      h-3 rounded-full bg-linear-to-r from-[#677FEB]
                      to-[#FFD600]
                    "
                    style={{ width: `${Math.min(100, userStats.totalDonations * 5 + userStats.streak * 2)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Beginner</span>
                  <span>Supporter</span>
                  <span>Champion</span>
                </div>
              </div>

              <h4 className="mb-3 text-sm text-gray-400 uppercase">Unlocked Rewards</h4>

              {userStats.totalDonations > 0 ? (
                <div className="space-y-3">
                  {userStats.totalDonations >= 5 && (
                    <div className="
                      flex items-center rounded-lg bg-gray-800 p-3
                    ">
                      <div className="
                        mr-3 flex size-10 items-center justify-center
                        rounded-full bg-[#FFD600]
                      ">
                        <Gift className="size-5 text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Early Supporter</p>
                        <p className="text-xs text-gray-400">Special badge on your profile</p>
                      </div>
                    </div>
                  )}

                  {userStats.streak >= 3 && (
                    <div className="
                      flex items-center rounded-lg bg-gray-800 p-3
                    ">
                      <div className="
                        mr-3 flex size-10 items-center justify-center
                        rounded-full bg-[#FFD600]
                      ">
                        <Gift className="size-5 text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Streak Bonus</p>
                        <p className="text-xs text-gray-400">Doubled impact on your next donation</p>
                      </div>
                    </div>
                  )}

                  <div className="
                    flex items-center rounded-lg bg-gray-800 p-3 opacity-50
                  ">
                    <div className="
                      mr-3 flex size-10 items-center justify-center rounded-full
                      bg-gray-700
                    ">
                      <Gift className="size-5 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Community Spotlight</p>
                      <p className="text-xs text-gray-400">Unlock at 20 donations</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400">
                  <Gift className="mx-auto mb-2 size-12 opacity-50" />
                  <p>No rewards yet</p>
                  <p className="text-sm">Make donations to unlock rewards</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="
          pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t
          from-[#1F2732] to-transparent
        "></div>
      </div>
    </div>
  )
}

interface TabButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      className={cn(
        "flex items-center px-3 py-2 text-sm whitespace-nowrap",
        isActive ? "border-b-2 border-[#FFD600] text-[#FFD600]" : `
          text-gray-400
        `,
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  )
}
