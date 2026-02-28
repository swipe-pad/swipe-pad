import { animate, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { useCallback, useEffect, useMemo, useState, type RefObject } from "react"

import { decisionFromPan, type CommitConfig, type SwipeDecision } from "@/components/swipe/engine"

type SwipeDirection = "left" | "right"

const SNAP = { type: "spring" as const, stiffness: 620, damping: 36, mass: 0.6 }
const EXIT_DURATION = 0.25
const EXIT_EASE: [number, number, number, number] = [0.36, 0.66, 0.04, 1]

export function useSwipeCardController(options: {
  cardRef: RefObject<HTMLElement | null>
  enabled: boolean
  isLoading: boolean
  resetKey: string
  onSwipe: (direction: SwipeDirection, decision?: SwipeDecision) => void
}) {
  const { cardRef, enabled, isLoading, resetKey, onSwipe } = options
  const [isSwipingOut, setIsSwipingOut] = useState(false)

  const commitConfig = useMemo<CommitConfig>(() => ({
    minStrengthToCommit: 0.2,
    offsetWeight: 1,
    velocityWeight: 0.6,
    angleGateDeg: 80,
  }), [])

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cardOpacity = useMotionValue(1)
  const puffScale = useMotionValue(1)

  const rotate = useTransform(x, [-220, 0, 220], [-12, 0, 12])
  const likeOverlayOpacity = useTransform(x, [0, 60, 120], [0, 0.28, 0.85])
  const skipOverlayOpacity = useTransform(x, [0, -60, -120], [0, 0.28, 0.85])
  const likeStampOpacity = useTransform(x, [0, 70, 140], [0, 0.35, 1])
  const skipStampOpacity = useTransform(x, [0, -70, -140], [0, 0.35, 1])
  const scale = useTransform(() => puffScale.get())

  const resetMotion = useCallback(() => {
    x.set(0)
    y.set(0)
    cardOpacity.set(1)
    puffScale.set(1)
  }, [cardOpacity, puffScale, x, y])

  const snapBack = useCallback(() => {
    animate(x, 0, SNAP)
    animate(y, 0, SNAP)
    animate(cardOpacity, 1, SNAP)
    animate(puffScale, 1, SNAP)
  }, [cardOpacity, puffScale, x, y])

  const flyOut = useCallback((direction: SwipeDirection, decision?: SwipeDecision) => {
    if (!enabled || isLoading || isSwipingOut) return

    setIsSwipingOut(true)

    const horizontal = Math.max(window.innerWidth * 0.7, 340)
    const tx = direction === "right" ? horizontal : -horizontal
    const ty = decision?.strength && decision.strength > 0.4 ? 24 : 0

    animate(x, tx, { duration: EXIT_DURATION, ease: EXIT_EASE })
    animate(y, ty, { duration: EXIT_DURATION, ease: EXIT_EASE })

    if (decision?.strength && decision.strength > 0.4) {
      animate(puffScale, 1.08, { duration: EXIT_DURATION, ease: "easeOut" })
    }

    animate(cardOpacity, 0, {
      duration: EXIT_DURATION * 0.8,
      ease: "easeOut",
      onComplete: () => {
        onSwipe(direction, decision)
        resetMotion()
        setIsSwipingOut(false)
      },
    })
  }, [cardOpacity, enabled, isLoading, isSwipingOut, onSwipe, puffScale, resetMotion, x, y])

  const triggerSwipe = useCallback((direction: SwipeDirection) => {
    flyOut(direction)
  }, [flyOut])

  const previewDirection = useCallback((direction: SwipeDirection) => {
    if (!enabled || isLoading || isSwipingOut) return
    animate(x, direction === "right" ? 56 : -56, { duration: 0.12, ease: "easeOut" })
  }, [enabled, isLoading, isSwipingOut, x])

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enabled || isLoading || isSwipingOut) return

    const dims = cardRef.current?.getBoundingClientRect()
    const width = dims?.width ?? 0
    const height = dims?.height ?? 0

    const decision = decisionFromPan(info, { width, height }, commitConfig)
    if (decision && (decision.dir === "left" || decision.dir === "right")) {
      flyOut(decision.dir, decision)
      return
    }

    snapBack()
  }, [cardRef, commitConfig, enabled, flyOut, isLoading, isSwipingOut, snapBack])

  useEffect(() => {
    resetMotion()
  }, [resetKey, resetMotion])

  return {
    x,
    y,
    rotate,
    cardOpacity,
    scale,
    likeOverlayOpacity,
    skipOverlayOpacity,
    likeStampOpacity,
    skipStampOpacity,
    isSwipingOut,
    triggerSwipe,
    previewDirection,
    handleDragEnd,
    snapBack,
  }
}
