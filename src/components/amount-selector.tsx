"use client"

import { useState } from "react"

export type DonationAmount = "0.01¢" | "0.10¢" | "0.50¢" | "1 Stable"
export type StableCoin = "cUSD" | "USDC" | "USDT"
export type ConfirmSwipes = 20 | 30 | 50

interface AmountSelectorProps {
  onSelect: (amount: DonationAmount, currency: StableCoin, swipes: ConfirmSwipes) => void
  availableProjects?: number
}

export function AmountSelector({ onSelect, availableProjects }: AmountSelectorProps) {
  const [selectedAmount, setSelectedAmount] = useState<DonationAmount>("0.01¢")
  const [selectedCurrency, setSelectedCurrency] = useState<StableCoin>("cUSD")
  const [selectedSwipes, setSelectedSwipes] = useState<ConfirmSwipes>(20)

  const amounts: DonationAmount[] = ["0.01¢", "0.10¢", "0.50¢", "1 Stable"]
  const currencies: StableCoin[] = ["cUSD", "USDC", "USDT"]
  const swipeOptions: ConfirmSwipes[] = [20, 30, 50]

  const handleConfirm = () => {
    onSelect(selectedAmount, selectedCurrency, selectedSwipes)
  }

  const totalCards = availableProjects ?? 0

  return (
    <div className="px-6 py-4">
      <h2 className="mb-2 text-xl font-bold text-white">Select Donation Amount</h2>

      <p className="mb-6 text-sm text-gray-400">Available Cards to Swipe: {totalCards}</p>

      {/* Amount Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-medium text-gray-300">Amount per swipe:</h3>
        <div className="grid grid-cols-4 gap-2">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setSelectedAmount(amount)}
              className={`
                rounded-lg px-2 py-3 text-sm font-medium transition-colors
                ${selectedAmount === amount ? `bg-[#FFD600] text-black` : `
                  bg-gray-700 text-gray-300
                  hover:bg-gray-600
                `
                }
              `}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      {/* Stablecoin Selection */}
      <div className="mb-6">
        <h3 className="mb-3 text-base font-medium text-gray-300">Stablecoin:</h3>
        <div className="grid grid-cols-3 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`
                rounded-lg px-4 py-3 font-medium transition-colors
                ${selectedCurrency === currency
                  ? "bg-[#FFD600] text-black"
                  : `
                    bg-gray-700 text-gray-300
                    hover:bg-gray-600
                  `
                }
              `}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Swipes Selection */}
      <div className="mb-8">
        <h3 className="mb-3 text-base font-medium text-gray-300">Confirm swipes:</h3>
        <div className="grid grid-cols-3 gap-3">
          {swipeOptions.map((swipes) => (
            <button
              key={swipes}
              onClick={() => setSelectedSwipes(swipes)}
              className={`
                rounded-lg px-4 py-3 font-medium transition-colors
                ${selectedSwipes === swipes ? `bg-[#FFD600] text-black` : `
                  bg-gray-700 text-gray-300
                  hover:bg-gray-600
                `
                }
              `}
            >
              {swipes}
            </button>
          ))}
        </div>
      </div>

      {/* Start Swiping Button */}
      <button
        onClick={handleConfirm}
        className="
          w-full rounded-lg bg-[#FFD600] py-4 font-bold text-black
          transition-colors
          hover:bg-[#E6C200]
        "
      >
        Start Swiping
      </button>
    </div>
  )
}
