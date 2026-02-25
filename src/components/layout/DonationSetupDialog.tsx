"use client"

import { X } from "lucide-react"

import { AmountSelector, type ConfirmSwipes, type DonationAmount, type StableCoin } from "@/components/amount-selector"

interface DonationSetupDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (amount: DonationAmount, currency: StableCoin, swipes: ConfirmSwipes) => void
  availableProjects?: number
}

export function DonationSetupDialog({
  isOpen,
  onClose,
  onSelect,
  availableProjects,
}: DonationSetupDialogProps) {
  if (!isOpen) return null

  return (
    <div className="
      fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4
    " onClick={onClose}>
      <div className="
        surface-panel-strong max-h-[90vh] w-full max-w-md overflow-y-auto
        rounded-2xl border border-surface-border shadow-2xl
      " onClick={(e) => e.stopPropagation()}>
        <div className="
          sticky top-0 z-10 flex items-center justify-between border-b
          border-surface-border bg-surface-2/95 px-4 py-3 backdrop-blur-xl
        ">
          <h2 className="text-base font-semibold text-white">Donation Setup</h2>
          <button onClick={onClose} className="
            rounded-md p-1 text-muted-foreground transition-colors
            hover:text-white
          " aria-label="Close donation setup">
            <X className="size-5" />
          </button>
        </div>

        <AmountSelector
          availableProjects={availableProjects}
          onSelect={(amount, currency, swipes) => {
            onSelect(amount, currency, swipes)
            onClose()
          }}
        />
      </div>
    </div>
  )
}
