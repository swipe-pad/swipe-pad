"use client"

import { useState, useMemo } from "react"
import type { Project } from "@/lib/useConvexData"
import type { StableCoin } from "@/components/amount-selector"

interface CartItem {
  project: Project
  amount: number
  currency: StableCoin
}

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onCheckout: () => void
}

export function Cart({ items, onClose, onCheckout }: CartProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const totals = useMemo(() => {
    const result: Record<StableCoin, number> = {
      cUSD: 0,
      USDC: 0,
      USDT: 0,
    }

    items.forEach((item) => {
      result[item.currency] += item.amount
    })

    return result
  }, [items])

  const handleCheckout = async () => {
    if (items.length < 5) {
      return
    }

    setIsProcessing(true)

    // Simulate transaction processing with MiniPay
    setTimeout(() => {
      setIsProcessing(false)
      onCheckout()
    }, 2000)
  }

  return (
    <div className="
      fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4
    " onClick={onClose}>
      <div className="
        surface-panel-strong flex max-h-[80vh] w-full max-w-md flex-col
        rounded-2xl border border-surface-border p-6 shadow-2xl
      " onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold">Your Donations</h3>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <XIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6">
              {items.map((item, index) => (
                <div key={index} className="
                  flex justify-between border-b border-gray-700 py-3
                ">
                  <div>
                    <h4 className="font-medium">{item.project.name}</h4>
                    <p className="text-sm text-gray-400">{item.project.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {item.amount} {item.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-700 pt-4">
              <div className="mb-6">
                <h4 className="mb-2 font-medium">Total by Currency:</h4>
                {Object.entries(totals).map(
                  ([currency, amount]) =>
                    amount > 0 && (
                      <div key={currency} className="
                        mb-1 flex justify-between text-sm
                      ">
                        <span>{currency}:</span>
                        <span className="font-bold">{amount.toFixed(2)}</span>
                      </div>
                    ),
                )}
              </div>

              {items.length < 5 ? (
                <div className="
                  mb-4 rounded-lg bg-yellow-900/30 p-3 text-sm text-yellow-300
                ">
                  Please select {5 - items.length} more project{items.length === 4 ? "" : "s"} to proceed
                </div>
              ) : null}

              <button
                onClick={handleCheckout}
                disabled={items.length < 5 || isProcessing}
                className={`
                  w-full rounded-lg py-3 font-medium transition-colors
                  ${
                  items.length >= 5 && !isProcessing
                    ? `
                      bg-[#677FEB] text-white
                      hover:bg-[#5A6FD3]
                    `
                    : "cursor-not-allowed bg-gray-700 text-gray-400"
                }
                `}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 -ml-1 size-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Confirm Donation"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
