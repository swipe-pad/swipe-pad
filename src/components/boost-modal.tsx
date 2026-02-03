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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Boost Project</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-2">Boosting:</p>
          <p className="text-white font-semibold truncate">{projectName}</p>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-sm mb-4">Select boost amount:</p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount)
                  setIsCustom(false)
                  setCustomAmount("")
                }}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAmount === amount && !isCustom
                    ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                    : "border-gray-600 text-gray-300 hover:border-gray-500"
                }`}
              >
                <DollarSign className="w-4 h-4 mx-auto mb-1" />
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
              className={`w-full p-3 rounded-lg border-2 transition-all ${
                isCustom ? "border-yellow-400 bg-yellow-400/10" : "border-gray-600 hover:border-gray-500"
              }`}
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
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none"
                min="0.01"
                step="0.01"
              />
            </div>
          )}
        </div>

        {(selectedAmount || (isCustom && customAmount)) && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Boost Amount:</span>
              <span className="text-white">${isCustom ? customAmount : selectedAmount}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">Platform Fee (5%):</span>
              <span className="text-white">${platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
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
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBoost}
            disabled={!selectedAmount && (!isCustom || !customAmount)}
            className="flex-1 py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Boost Project</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">Boosted projects get higher visibility in the feed</p>
      </div>
    </div>
  )
}
