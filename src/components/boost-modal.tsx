"use client"

import { useState } from "react"
import { X, Zap, DollarSign } from "lucide-react"

interface BoostModalProps {
  isOpen: boolean
  onClose: () => void
  projectName: string
  onBoost: (amount: number) => void
}

export function BoostModal({ isOpen, onClose, projectName, onBoost }: BoostModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isCustom, setIsCustom] = useState(false)

  if (!isOpen) return null

  const presetAmounts = [1, 5, 10]

  const handleBoost = () => {
    const amount = isCustom ? Number.parseFloat(customAmount) : selectedAmount
    if (amount && amount > 0) {
      onBoost(amount)
      onClose()
      setSelectedAmount(null)
      setCustomAmount("")
      setIsCustom(false)
    }
  }

  const platformFee = (isCustom ? Number.parseFloat(customAmount) || 0 : selectedAmount || 0) * 0.05

  return (
    <div className="
      bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black
      p-4
    ">
      <div className="
        w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6
      ">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="size-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Boost Project</h2>
          </div>
          <button onClick={onClose} className="
            text-gray-400 transition-colors
            hover:text-white
          ">
            <X className="size-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm text-gray-300">Boosting:</p>
          <p className="truncate font-semibold text-white">{projectName}</p>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-sm text-gray-300">Select boost amount:</p>

          <div className="mb-4 grid grid-cols-3 gap-3">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setIsCustom(false)
                  setCustomAmount("")
                }}
                className={`
                  rounded-lg border-2 p-3 transition-all
                  ${
                  selectedAmount === amount && !isCustom
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                    : `
                      border-gray-600 text-gray-300
                      hover:border-gray-500
                    `
                }
                `}
              >
                <DollarSign className="mx-auto mb-1 size-4" />
                <span className="font-semibold">{amount}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <button
              onClick={() => {
                setIsCustom(true)
                setSelectedAmount(null)
              }}
              className={`
                w-full rounded-lg border-2 p-3 transition-all
                ${
                isCustom ? "border-yellow-400 bg-yellow-400/10" : `
                  border-gray-600
                  hover:border-gray-500
                `
              }
              `}
            >
              <span className="text-gray-300">Custom Amount</span>
            </button>
          </div>

          {isCustom && (
            <div className="mb-4">
              <input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="
                  w-full rounded-lg border border-gray-600 bg-gray-800 p-3
                  text-white placeholder-gray-400
                  focus:border-yellow-400 focus:outline-none
                "
                min="0.01"
                step="0.01"
              />
            </div>
          )}
        </div>

        {(selectedAmount || (isCustom && customAmount)) && (
          <div className="mb-6 rounded-lg bg-gray-800 p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-300">Boost Amount:</span>
              <span className="text-white">${isCustom ? customAmount : selectedAmount}</span>
            </div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-300">Platform Fee (5%):</span>
              <span className="text-white">${platformFee.toFixed(2)}</span>
            </div>
            <div className="mt-2 border-t border-gray-600 pt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-300">Total:</span>
                <span className="text-yellow-400">
                  ${((isCustom ? Number.parseFloat(customAmount) || 0 : selectedAmount || 0) + platformFee).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="
              flex-1 rounded-lg bg-gray-700 px-4 py-3 font-medium text-white
              transition-colors
              hover:bg-gray-600
            "
          >
            Cancel
          </button>
          <button
            onClick={handleBoost}
            disabled={!selectedAmount && (!isCustom || !customAmount)}
            className="
              flex flex-1 items-center justify-center space-x-2 rounded-lg
              bg-yellow-400 px-4 py-3 font-medium text-black transition-colors
              hover:bg-yellow-500
              disabled:cursor-not-allowed disabled:bg-gray-600
            "
          >
            <Zap className="size-4" />
            <span>Boost Project</span>
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">Boosted projects get higher visibility in the feed</p>
      </div>
    </div>
  )
}
