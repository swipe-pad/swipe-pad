"use client"

import { useEffect } from "react"
import { Award, X } from "lucide-react"
import confetti from "canvas-confetti"

interface BadgeNotificationProps {
  badge: string
  onClose: () => void
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  useEffect(() => {
    // Trigger confetti
    const duration = 2 * 1000
    const end = Date.now() + duration

    let animationFrame: number | null = null
    let isActive = true

    const frame = () => {
      if (!isActive) return

      try {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#FFD600", "#677FEB", "#5454F3"],
        })
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#FFD600", "#677FEB", "#5454F3"],
        })

        if (Date.now() < end && isActive) {
          animationFrame = requestAnimationFrame(frame)
        }
      } catch (error) {
        console.error("Error in confetti animation:", error)
      }
    }

    // Start the animation
    try {
      animationFrame = requestAnimationFrame(frame)
    } catch (error) {
      console.error("Error starting animation:", error)
    }

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => {
      // Clean up animation and timer
      isActive = false
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
      }
      clearTimeout(timer)
      // Reset confetti
      try {
        confetti.reset()
      } catch (error) {
        console.error("Error resetting confetti:", error)
      }
    }
  }, [onClose])

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
      <div className="
        animate-slide-up w-full max-w-sm rounded-xl border border-[#FFD600]/30
        bg-gray-900 p-4 shadow-lg
      ">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="flex items-center text-lg font-bold text-[#FFD600]">
            <Award className="mr-2 size-5" /> New Badge Earned!
          </h3>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex items-center">
          <div className="
            mr-4 flex size-16 items-center justify-center rounded-full
            bg-[#FFD600]
          ">
            <Award className="size-8 text-black" />
          </div>
          <div>
            <p className="font-bold text-white">{badge}</p>
            <p className="text-sm text-gray-300">Keep up the great work!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
