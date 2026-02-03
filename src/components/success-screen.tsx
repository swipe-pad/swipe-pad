"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

interface SuccessScreenProps {
  onClose: () => void
  categories: string[]
}

export function SuccessScreen({ onClose, categories }: SuccessScreenProps) {
  useEffect(() => {
    // Simple one-time confetti burst
    const triggerConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD600", "#677FEB", "#5454F3"],
      })
    }

    triggerConfetti()
  }, [])

  const handleExploreMore = () => {
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2732] rounded-xl w-full max-w-md p-6 shadow-xl text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2">Thanks for supporting these projects!</h3>
          <p className="text-gray-300">Your donation has been processed successfully.</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Categories you supported:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <span key={category} className="px-3 py-1 bg-[#677FEB]/20 text-[#677FEB] rounded-full text-sm">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleExploreMore}
            className="w-full py-3 bg-[#677FEB] hover:bg-[#5A6FD3] text-white font-medium rounded-lg transition-colors"
          >
            Explore More Projects
          </button>
          <button
            onClick={handleClose}
            className="w-full py-3 bg-transparent hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors border border-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
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
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
