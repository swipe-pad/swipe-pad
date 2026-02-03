"use client"

import { useApp } from "@/context/AppContext"
import { ToggleMenu } from "@/components/toggle-menu"
import { CategoryMenu } from "@/components/category-menu"
import { ProjectCard } from "@/components/project-card"
import { AmountSelector } from "@/components/amount-selector"
import { projects, categories } from "@/lib/data"
import { useRouter } from "next/navigation"

export default function SwipePage() {
    const router = useRouter()
    const {
        currentProjectIndex, setCurrentProjectIndex,
        selectedCategory, setSelectedCategory,
        donationAmount, setDonationAmount,
        donationCurrency, setDonationCurrency,
        confirmSwipes, setConfirmSwipes,
        swipeCount, setSwipeCount,
        setUserStats, setUserProfile,
        cart, setCart
    } = useApp()

    const filteredProjects = projects.filter((project) => project.category === selectedCategory)

    const handleSwipeRight = () => {
        if (donationAmount === null) return
        const project = filteredProjects[currentProjectIndex]

        setUserStats((prev: any) => {
            const categoriesSupported = new Set(prev.categoriesSupported)
            categoriesSupported.add(project.category)
            return {
                totalDonations: prev.totalDonations + 1,
                categoriesSupported,
                streak: prev.lastDonation ? prev.streak + 1 : 1,
                lastDonation: new Date(),
            }
        })

        const amountNum = typeof donationAmount === 'string' ? parseFloat(donationAmount.split(" ")[0]) : 0.01
        setUserProfile((prev: any) => ({
            ...prev,
            totalSwipes: prev.totalSwipes + 1,
            totalDonated: prev.totalDonated + amountNum,
        }))

        setCart([...cart, { project, amount: amountNum, currency: donationCurrency }])

        const newCount = swipeCount + 1
        if (newCount >= confirmSwipes) {
            setSwipeCount(0)
        } else {
            setSwipeCount(newCount)
        }

        setCurrentProjectIndex(currentProjectIndex < filteredProjects.length - 1 ? currentProjectIndex + 1 : 0)
    }

    const handleSwipeLeft = () => {
        setUserProfile((prev: any) => ({ ...prev, totalSwipes: prev.totalSwipes + 1 }))
        setCurrentProjectIndex(currentProjectIndex < filteredProjects.length - 1 ? currentProjectIndex + 1 : 0)
    }

    return (
        <div className="py-6">
            <ToggleMenu viewMode="swipe" setViewMode={(mode) => mode === 'list' && router.push('/list')} />

            {donationAmount === null ? (
                <AmountSelector onSelect={(amount, currency, swipes) => {
                    if (!document.startViewTransition) {
                        setDonationAmount(amount)
                        setDonationCurrency(currency)
                        setConfirmSwipes(swipes)
                        setSwipeCount(0)
                        return
                    }
                    document.startViewTransition(() => {
                        setDonationAmount(amount)
                        setDonationCurrency(currency)
                        setConfirmSwipes(swipes)
                        setSwipeCount(0)
                    })
                }} />
            ) : (
                <>
                    <CategoryMenu
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        setCurrentProjectIndex={() => setCurrentProjectIndex(0)}
                    />

                    <div className="mb-2 px-6">
                        <div className="flex justify-between items-center">
                            <div className="p-2 px-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                                <span className="text-sm text-gray-300">Donating: </span>
                                <span className="font-bold text-[#FFD600]">
                                    {donationAmount} {donationCurrency}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (document.startViewTransition) {
                                        document.startViewTransition(() => setDonationAmount(null))
                                    } else {
                                        setDonationAmount(null)
                                    }
                                }}
                                className="text-sm text-gray-400 hover:text-white underline transition-colors"
                            >
                                Change
                            </button>
                        </div>
                        <div className="mt-4 bg-gray-800/30 rounded-full h-3 border border-gray-700/30 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-[#FFD600] to-yellow-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,214,0,0.5)]"
                                style={{ width: `${(swipeCount / confirmSwipes) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 text-right italic">
                            {confirmSwipes - swipeCount} swipes to confirm
                        </p>
                    </div>

                    <div className="px-6 mt-4">
                        {filteredProjects.length > 0 && (
                            <ProjectCard
                                project={filteredProjects[currentProjectIndex]}
                                onSwipeLeft={handleSwipeLeft}
                                onSwipeRight={handleSwipeRight}
                                viewMode="swipe"
                                donationAmount={donationAmount}
                                donationCurrency={donationCurrency}
                                onBoost={(amount) => console.log('boost', amount)}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
