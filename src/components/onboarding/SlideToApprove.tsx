"use client"

import { useState } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import confetti from "canvas-confetti"
import { ChevronRight } from "lucide-react"

interface SlideToApproveProps {
    onComplete: () => void
}

export function SlideToApprove({ onComplete }: SlideToApproveProps) {
    const x = useMotionValue(0)
    const [completed, setCompleted] = useState(false)

    const trackWidth = 240
    const handleSize = 52
    const padding = 4
    const trackHeight = handleSize + padding * 2
    const maxDrag = trackWidth - handleSize - padding * 2

    const fillWidth = useTransform(x, (value) => value + handleSize)
    const textOpacity = useTransform(x, [0, maxDrag * 0.7], [1, 0])

    const handleDragEnd = async () => {
        if (completed) return

        if (x.get() > maxDrag * 0.9) {
            setCompleted(true)
            animate(x, maxDrag, { type: "spring", stiffness: 700, damping: 40 })

            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.8 },
                colors: ["#F9DE4B", "#FFFFFF"],
            })

            setTimeout(() => {
                onComplete()
            }, 350)
            return
        }

        animate(x, 0, { type: "spring", stiffness: 700, damping: 40 })
    }

    return (
        <div
            className="
              relative overflow-hidden rounded-full border border-white/10
              bg-zinc-900/60 shadow-2xl
            "
            style={{ width: trackWidth, height: trackHeight }}
        >
            <div className="
              pointer-events-none absolute inset-0 z-10 flex items-center
              justify-center
            ">
                <motion.span
                    className="
                      text-base font-medium tracking-wide text-zinc-400
                    "
                    style={{ opacity: textOpacity }}
                >
                    Enter SwipePad
                </motion.span>
            </div>

            <motion.div
                className="
                  absolute top-1 left-1 z-10 overflow-hidden rounded-full
                  bg-[#F9DE4B]
                "
                style={{ width: fillWidth, height: handleSize }}
            >
                <div className="
                  pointer-events-none absolute top-0 left-0 flex h-full
                  items-center justify-center
                " style={{ width: trackWidth - padding * 2 }}>
                    <span className="
                      text-sm font-extrabold tracking-wide whitespace-nowrap
                      text-black
                    ">20 Free Swipes!!</span>
                </div>
            </motion.div>

            <motion.div
                className="
                  absolute top-1 left-1 z-20 flex cursor-grab items-center
                  justify-center rounded-full bg-[#F9DE4B] text-black
                  shadow-[0_0_20px_rgba(249,222,75,0.35)]
                  active:cursor-grabbing
                "
                style={{ width: handleSize, height: handleSize, x }}
                drag="x"
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                dragMomentum={false}
                whileTap={{ scale: 0.95 }}
                onDragEnd={handleDragEnd}
            >
                <ChevronRight className="size-6" strokeWidth={2.5} />
            </motion.div>
        </div>
    )
}
