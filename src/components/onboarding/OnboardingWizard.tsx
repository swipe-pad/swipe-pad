"use client"

import { useEffect, useState, type TouchEvent } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SlideToApprove } from "@/components/onboarding/SlideToApprove"

interface OnboardingWizardProps {
    onComplete: () => void
}

const steps = [
    {
        title: "Welcome to SwipePad",
        description: "Easy login to explore vetted projects.",
    },
    {
        title: "Swipe and Discover",
        description: "Borderless reach at your fingertips.\nSwipe right to support, left to skip.",
    },
    {
        title: "Global Leaderboard",
        description: "Climb the rankings to win prizes.\nBoost your favorite projects.",
    },
]

const fanCards = [
    { id: 0, src: "/assets/card-left.png", alt: "Project A" },
    { id: 1, src: "/assets/card-right.png", alt: "Project B" },
    { id: 2, src: "/assets/card-center.png", alt: "Project C" },
]

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [cardIndex, setCardIndex] = useState(0)
    const [touchStart, setTouchStart] = useState<number | null>(null)
    const [touchEnd, setTouchEnd] = useState<number | null>(null)

    useEffect(() => {
        const timer = setInterval(() => {
            setCardIndex((prev) => (prev + 1) % 3)
        }, 2200)

        return () => clearInterval(timer)
    }, [])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        setTouchEnd(null)
        setTouchStart(event.targetTouches[0].clientX)
    }

    const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
        setTouchEnd(event.targetTouches[0].clientX)
    }

    const onTouchEnd = () => {
        if (touchStart === null || touchEnd === null) return

        const distance = touchStart - touchEnd
        const minSwipeDistance = 50

        if (distance > minSwipeDistance) {
            handleNext()
            return
        }

        if (distance < -minSwipeDistance) {
            handlePrev()
        }
    }

    return (
        <div
            className="
              fixed inset-0 z-110 flex h-dvh flex-col justify-between
              overflow-hidden bg-zinc-950 select-none
            "
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="
              relative flex min-h-0 w-full flex-1 items-center justify-center
              px-4 pt-8
            ">
                <div className="
                  relative flex size-full max-h-[55vh] items-center
                  justify-center
                ">
                    {fanCards.map((card, i) => {
                        const offset = (i - cardIndex + 3) % 3
                        const isFront = offset === 0
                        const isMiddle = offset === 1

                        let zIndex = 10
                        let x = "-40%"
                        let rotate = 12
                        let top = 16
                        let scale: number | number[] = 0.9

                        if (isFront) {
                            zIndex = 30
                            x = "-50%"
                            rotate = 0
                            top = 32
                            scale = [0.9, 1.05, 1]
                        } else if (isMiddle) {
                            zIndex = 20
                            x = "-60%"
                            rotate = -12
                            top = 16
                        }

                        return (
                            <motion.div
                                key={card.id}
                                className="absolute left-1/2"
                                animate={{
                                    zIndex,
                                    x,
                                    top,
                                    rotate: isFront ? 0 : rotate,
                                    scale,
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: "backOut",
                                    scale: { duration: 0.4, ease: "easeOut" },
                                }}
                            >
                                <div className="animate-float" style={{ animationDelay: `${i * 1.5}s` }}>
                                    <img
                                        src={card.src}
                                        alt={card.alt}
                                        className="
                                          h-[290px] w-48 rounded-2xl border-4
                                          border-zinc-800 object-cover shadow-xl
                                          sm:h-[340px] sm:w-56
                                          md:h-[420px] md:w-72
                                        "
                                        draggable={false}
                                    />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            <div className="
              z-50 flex w-full flex-none flex-col items-center justify-end
              bg-linear-to-t from-zinc-950 via-zinc-950/90 to-transparent px-8
              pt-4 pb-8 text-center
            ">
                <div key={currentStep} className="
                  animate-in fade-in slide-in-from-bottom-4 w-full duration-300
                ">
                    <h2
                        className={`
                          mb-2 text-xl font-bold text-white
                          sm:text-2xl
                          ${currentStep === 0 ? `tracking-widest` : ""}
                        `}
                        style={currentStep === 0 ? { fontFamily: "Pixelify Sans, monospace" } : undefined}
                    >
                        {steps[currentStep].title}
                    </h2>
                    <p className={`
                      mx-auto flex min-h-12 items-center justify-center
                      text-xs/relaxed tracking-tight whitespace-pre-wrap
                      text-zinc-400
                      sm:text-sm
                      ${currentStep === 0 ? `whitespace-nowrap` : `
                        max-w-[320px]
                      `}
                    `}>
                        {steps[currentStep].description}
                    </p>
                </div>

                <div className="mt-4 mb-6 flex justify-center gap-2">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`
                              h-1.5 rounded-full transition-all duration-300
                              ${index === currentStep ? `w-6 bg-[#F9DE4B]` : `
                                w-1.5 bg-zinc-700
                              `}
                            `}
                        />
                    ))}
                </div>

                <div className="flex h-16 w-full items-center justify-center">
                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="
                              flex items-center gap-2 rounded-full border
                              border-zinc-700 bg-zinc-800/80 px-10 py-3
                              font-bold text-white transition-all
                              hover:bg-zinc-700
                              active:scale-95
                            "
                        >
                            <span>Next</span>
                            <ArrowRight className="size-4" />
                        </button>
                    ) : (
                        <SlideToApprove onComplete={onComplete} />
                    )}
                </div>
            </div>
        </div>
    )
}
