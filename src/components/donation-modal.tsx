"use client"

import { useState } from "react"
import type { Project } from "@/lib/useConvexData"

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
    <div className="
      fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4
    " onClick={onClose}>
      <div className="
        surface-panel-strong w-full max-w-md rounded-2xl border
        border-surface-border p-6 shadow-2xl
      " onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold">Donate to {project.name}</h3>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <XIcon />
          </button>
        </div>

        <p className="mb-6 text-gray-300">{project.description}</p>

        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium">Select amount (cUSD)</h4>
          <div className="grid grid-cols-3 gap-3">
            {[5, 10, 20].map((value) => (
              <button
                key={value}
                className={`
                  rounded-lg py-3 font-medium transition-colors
                  ${
                  amount === value ? "bg-[#FFD600] text-black" : `
                    bg-gray-700 text-white
                    hover:bg-gray-600
                  `
                }
                `}
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
          <h4 className="mb-2 text-sm font-medium">Custom amount (cUSD)</h4>
          <div className="relative">
            <span className="
              absolute top-1/2 left-3 -translate-y-1/2 text-gray-400
            ">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setAmount(null)
              }}
              placeholder="Enter amount"
              className="
                w-full rounded-lg bg-gray-700 py-3 pr-3 pl-8 text-white
                placeholder-gray-400
                focus:ring-2 focus:ring-[#677FEB] focus:outline-none
              "
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="
              flex-1 rounded-lg bg-gray-700 py-3 font-medium text-white
              transition-colors
              hover:bg-gray-600
            "
          >
            Cancel
          </button>
          <button
            onClick={handleDonate}
            disabled={!amount && !customAmount}
            className={`
              flex-1 rounded-lg py-3 font-medium transition-colors
              ${
              amount || customAmount
                ? `
                  bg-[#677FEB] text-white
                  hover:bg-[#5A6FD3]
                `
                : "cursor-not-allowed bg-gray-700 text-gray-400"
            }
            `}
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
