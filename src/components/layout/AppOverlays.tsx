"use client"

import dynamic from "next/dynamic"

import type { ConfirmSwipes, DonationAmount, StableCoin } from "@/components/amount-selector"

const Cart = dynamic(() => import("@/components/cart").then((mod) => mod.Cart))
const SuccessScreen = dynamic(() => import("@/components/success-screen").then((mod) => mod.SuccessScreen))
const BadgeNotification = dynamic(() => import("@/components/badge-notification").then((mod) => mod.BadgeNotification))
const ProfileQuickView = dynamic(() => import("@/components/profile-quick-view").then((mod) => mod.ProfileQuickView))
const EditProfile = dynamic(() => import("@/components/edit-profile").then((mod) => mod.EditProfile))
const ProjectRegistrationForm = dynamic(() => import("@/components/project-registration-form").then((mod) => mod.ProjectRegistrationForm))
const DonationSetupDialog = dynamic(() => import("@/components/layout/DonationSetupDialog").then((mod) => mod.DonationSetupDialog))

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

      {showProfileQuickView ? (
        <ProfileQuickView
          isOpen={showProfileQuickView}
          onClose={onCloseProfileQuickView}
          userStats={userStats}
          recentDonations={recentDonations as never[]}
          savedProjects={savedProjects as never[]}
        />
      ) : null}

      {showEditProfile ? (
        <EditProfile
          isOpen={showEditProfile}
          onClose={onCloseEditProfile}
          onSave={onSaveProfile}
          currentProfile={userProfile as never}
        />
      ) : null}

      {enableProjectRegistration ? (
        <ProjectRegistrationForm
          isOpen={showRegistrationForm}
          onClose={onCloseRegistrationForm}
          onSubmit={onSubmitRegistrationForm}
        />
      ) : null}

      {showDonationSetup ? (
        <DonationSetupDialog
          isOpen={showDonationSetup}
          onClose={onCloseDonationSetup}
          onSelect={onSelectDonationSetup}
          availableProjects={availableProjects}
        />
      ) : null}
    </>
  )
}
