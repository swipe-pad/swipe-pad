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
    <div className="
      fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4
    ">
      <div className="
        w-full max-w-md rounded-xl bg-[#1F2732] p-6 text-center shadow-xl
      ">
        <div className="mb-6">
          <div className="
            mx-auto mb-4 flex size-16 items-center justify-center rounded-full
            bg-green-500
          ">
            <CheckIcon className="size-8 text-white" />
          </div>
          <h3 className="mb-2 text-xl font-bold">Thanks for supporting these projects!</h3>
          <p className="text-gray-300">Your donation has been processed successfully.</p>
        </div>

        {categories.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-medium">Categories you supported:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <span key={category} className="
                  rounded-full bg-[#677FEB]/20 px-3 py-1 text-sm text-[#677FEB]
                ">
                  {category}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleExploreMore}
            className="
              w-full rounded-lg bg-[#677FEB] py-3 font-medium text-white
              transition-colors
              hover:bg-[#5A6FD3]
            "
          >
            Explore More Projects
          </button>
          <button
            onClick={handleClose}
            className="
              w-full rounded-lg border border-gray-700 bg-transparent py-3
              font-medium text-gray-300 transition-colors
              hover:bg-gray-800
            "
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
