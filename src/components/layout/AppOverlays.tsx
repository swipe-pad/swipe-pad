"use client"

import { Cart } from "@/components/cart"
import { SuccessScreen } from "@/components/success-screen"
import { BadgeNotification } from "@/components/badge-notification"
import { ProfileQuickView } from "@/components/profile-quick-view"
import { EditProfile } from "@/components/edit-profile"
import { ProjectRegistrationForm } from "@/components/project-registration-form"
import { DonationSetupDialog } from "@/components/layout/DonationSetupDialog"
import type { ConfirmSwipes, DonationAmount, StableCoin } from "@/components/amount-selector"

interface AppOverlaysProps {
  showCart: boolean
  showSuccess: boolean
  showBadgeNotification: boolean
  currentBadge: string
  showProfileQuickView: boolean
  showEditProfile: boolean
  showRegistrationForm: boolean
  showDonationSetup: boolean
  enableProjectRegistration: boolean
  cart: unknown[]
  successCategories: string[]
  userStats: {
    totalDonations: number
    categoriesSupported: Set<string>
    streak: number
    lastDonation: Date | null
  }
  savedProjects: unknown[]
  availableProjects: number
  recentDonations: unknown[]
  userProfile: Record<string, unknown>
  onCloseCart: () => void
  onCheckout: () => void
  onCloseSuccess: () => void
  onCloseBadgeNotification: () => void
  onCloseProfileQuickView: () => void
  onCloseEditProfile: () => void
  onSaveProfile: (data: Record<string, unknown>) => void
  onCloseRegistrationForm: () => void
  onSubmitRegistrationForm: (data: Record<string, unknown>) => void
  onCloseDonationSetup: () => void
  onSelectDonationSetup: (amount: DonationAmount, currency: StableCoin, swipes: ConfirmSwipes) => void
}

export function AppOverlays({
  showCart,
  showSuccess,
  showBadgeNotification,
  currentBadge,
  showProfileQuickView,
  showEditProfile,
  showRegistrationForm,
  showDonationSetup,
  enableProjectRegistration,
  cart,
  successCategories,
  userStats,
  savedProjects,
  availableProjects,
  recentDonations,
  userProfile,
  onCloseCart,
  onCheckout,
  onCloseSuccess,
  onCloseBadgeNotification,
  onCloseProfileQuickView,
  onCloseEditProfile,
  onSaveProfile,
  onCloseRegistrationForm,
  onSubmitRegistrationForm,
  onCloseDonationSetup,
  onSelectDonationSetup,
}: AppOverlaysProps) {
  return (
    <>
      {showCart ? <Cart items={cart as never[]} onClose={onCloseCart} onCheckout={onCheckout} /> : null}

      {showSuccess ? <SuccessScreen onClose={onCloseSuccess} categories={successCategories} /> : null}

      {showBadgeNotification ? <BadgeNotification badge={currentBadge} onClose={onCloseBadgeNotification} /> : null}

      <ProfileQuickView
        isOpen={showProfileQuickView}
        onClose={onCloseProfileQuickView}
        userStats={userStats}
        recentDonations={recentDonations as never[]}
        savedProjects={savedProjects as never[]}
      />

      <EditProfile
        isOpen={showEditProfile}
        onClose={onCloseEditProfile}
        onSave={onSaveProfile}
        currentProfile={userProfile as never}
      />

      {enableProjectRegistration ? (
        <ProjectRegistrationForm
          isOpen={showRegistrationForm}
          onClose={onCloseRegistrationForm}
          onSubmit={onSubmitRegistrationForm}
        />
      ) : null}

      <DonationSetupDialog
        isOpen={showDonationSetup}
        onClose={onCloseDonationSetup}
        onSelect={onSelectDonationSetup}
        availableProjects={availableProjects}
      />
    </>
  )
}
