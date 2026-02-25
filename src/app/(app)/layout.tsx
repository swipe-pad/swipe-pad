"use client"

import { useApp } from "@/context/AppContext"
import { usePathname } from "next/navigation"
import { useShallow } from "zustand/react/shallow"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { AppHeader } from "@/components/layout/AppHeader"
import { BottomNav } from "@/components/layout/BottomNav"
import { AppShell } from "@/components/layout/AppShell"
import { AppOverlays } from "@/components/layout/AppOverlays"
import { useAppBootstrap } from "@/hooks/use-app-bootstrap"
import { useAppOverlays } from "@/hooks/use-app-overlays"
import { useAppShellConfig } from "@/hooks/use-app-shell-config"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const {
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        hasLoadedOnboardingState,
        cart,
        donationAmount,
    } = useApp(useShallow((state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        setHasCompletedOnboarding: state.setHasCompletedOnboarding,
        hasLoadedOnboardingState: state.hasLoadedOnboardingState,
        cart: state.cart,
        donationAmount: state.donationAmount,
    })))
    const shellConfig = useAppShellConfig(pathname)
    const overlays = useAppOverlays()

    const ENABLE_PROJECT_REGISTRATION = false

    useAppBootstrap()

    const renderPageContainer = (children: React.ReactNode) => {
        return <div className="
          relative flex h-screen w-full flex-col overflow-hidden
        ">{children}</div>
    }

    if (!hasLoadedOnboardingState) {
        return (
            <main className="
              relative flex min-h-screen flex-col items-center justify-center
              overflow-hidden text-white
            ">
                {renderPageContainer(<div className="size-full" />)}
            </main>
        )
    }

    if (!hasCompletedOnboarding) {
        return (
            <main className="
              relative flex min-h-screen flex-col items-center justify-center
              overflow-hidden text-white
            ">
                {renderPageContainer(
                    <OnboardingWizard onComplete={() => setHasCompletedOnboarding(true)} />
                )}
            </main>
        )
    }

    return (
        <main className="
          relative flex min-h-screen flex-col items-center justify-center
          overflow-hidden text-white
        ">
            {renderPageContainer(
                <>
                    <AppShell
                        header={
                            shellConfig.showHeader ? (
                                <AppHeader
                                    donationAmountLabel={donationAmount ?? "0.01¢"}
                                    cartCount={cart.length}
                                    isTrendingActive={shellConfig.highlightTrending}
                                    isLeaderboardActive={shellConfig.highlightLeaderboard}
                                    onOpenCart={() => overlays.setShowCart(true)}
                                    onOpenDonationSetup={() => overlays.setShowDonationSetup(true)}
                                />
                            ) : null
                        }
                        footer={shellConfig.showBottomNav ? <BottomNav /> : null}
                    >
                        <div className={`view-content app-content-wrapper h-full ${pathname === "/" || pathname.startsWith("/p/") ? "overflow-visible" : "custom-scrollbar overflow-y-auto"}`}>
                            {children}
                        </div>
                    </AppShell>

                    <AppOverlays
                        showCart={overlays.showCart}
                        showSuccess={overlays.showSuccess}
                        showBadgeNotification={overlays.showBadgeNotification}
                        currentBadge={overlays.currentBadge}
                        showProfileQuickView={overlays.showProfileQuickView}
                        showEditProfile={overlays.showEditProfile}
                        showRegistrationForm={overlays.showRegistrationForm}
                        showDonationSetup={overlays.showDonationSetup}
                        enableProjectRegistration={ENABLE_PROJECT_REGISTRATION}
                        cart={overlays.cart}
                        successCategories={overlays.categoriesFromCheckout}
                        userStats={overlays.userStats}
                        savedProjects={overlays.projects.slice(0, 3)}
                        availableProjects={overlays.projects.length}
                        recentDonations={overlays.recentDonations}
                        userProfile={overlays.userProfile}
                        onCloseCart={() => overlays.setShowCart(false)}
                        onCheckout={overlays.handleCheckout}
                        onCloseSuccess={() => overlays.setShowSuccess(false)}
                        onCloseBadgeNotification={() => overlays.setShowBadgeNotification(false)}
                        onCloseProfileQuickView={() => overlays.setShowProfileQuickView(false)}
                        onCloseEditProfile={() => overlays.setShowEditProfile(false)}
                        onSaveProfile={overlays.handleSaveProfile}
                        onCloseRegistrationForm={() => overlays.setShowRegistrationForm(false)}
                        onSubmitRegistrationForm={(data) => console.log(data)}
                        onCloseDonationSetup={() => overlays.setShowDonationSetup(false)}
                        onSelectDonationSetup={overlays.handleDonationSetupSelect}
                    />
                </>
            )}
        </main>
    )
}
