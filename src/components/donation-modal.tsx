"use client"

import { useState } from "react"
import type { Project } from "@/lib/data"

interface DonationModalProps {
  project: Project
  onClose: () => void
  onDonate: (amount: number) => void
}

export function DonationModal({ project, onClose, onDonate }: DonationModalProps) {
  const [amount, setAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")

  const handleDonate = () => {
    if (amount) {
      onDonate(amount)
    } else if (customAmount && !isNaN(Number.parseFloat(customAmount))) {
      onDonate(Number.parseFloat(customAmount))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2732] rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Donate to {project.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>

        <p className="text-gray-300 mb-6">{project.description}</p>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Select amount (cUSD)</h4>
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 20].map((value) => (
              <button
                key={value}
                className={`py-3 rounded-lg font-medium transition-colors ${
                  amount === value ? "bg-[#FFD600] text-black" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                onClick={() => {
                  setAmount(value)
                  setCustomAmount("")
                }}
              >
                ${value}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2">Custom amount (cUSD)</h4>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount(null)
              }}
              placeholder="Enter amount"
              className="w-full bg-gray-700 rounded-lg py-3 pl-8 pr-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#677FEB]"
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDonate}
            disabled={!amount && !customAmount}
            className={`flex-1 py-3 font-medium rounded-lg transition-colors ${
              amount || customAmount
                ? "bg-[#677FEB] hover:bg-[#5A6FD3] text-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            Donate
          </button>
        </div>
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
