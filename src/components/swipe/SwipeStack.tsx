"use client"

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useMemo,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react"

import { computeDecision, type CommitConfig, type SwipeDecision, type SwipeDir } from "@/components/swipe/engine"
import type { SwipeItem } from "@/components/swipe/use-swipe-deck"

const SNAP = { type: "spring" as const, stiffness: 650, damping: 40, mass: 0.6 }
const EXIT_DURATION = 0.32
const EXIT_EASE: [number, number, number, number] = [0.36, 0.66, 0.04, 1]

type MeasureRect = { width: number; height: number }

function useMeasureRect<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [rect, setRect] = useState<MeasureRect>({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(() => {
      const next = element.getBoundingClientRect()
      setRect({ width: next.width, height: next.height })
    })

    observer.observe(element)
    const next = element.getBoundingClientRect()
    setRect({ width: next.width, height: next.height })

    return () => {
      observer.disconnect()
    }
  }, [])

  return { ref, rect }
}

export type SwipeStackHandle = {
  swipe: (dir: SwipeDir) => void
}

type TopCardProps<T> = {
  item: SwipeItem<T>
  render: (item: SwipeItem<T>) => ReactNode
  stackRotation: number
  stackY: number
  containerW: number
  containerH: number
  busyRef: MutableRefObject<boolean>
  commitConfig: CommitConfig
  onCommit: (decision: SwipeDecision) => void
  canSwipeDirection?: (dir: SwipeDir) => boolean
  disabled?: boolean
}

const TopSwipeCard = forwardRef(function TopSwipeCardInner<T>(
  {
    item,
    render,
    stackRotation,
    stackY,
    containerW,
    containerH,
    busyRef,
    commitConfig,
    onCommit,
    canSwipeDirection,
    disabled = false,
  }: TopCardProps<T>,
  ref: React.Ref<SwipeStackHandle>,
) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cardOpacity = useMotionValue(1)
  const puffScale = useMotionValue(1)

  const stampTriggerDist = (containerW || 300) * 0.15
  const fundOpacity = useTransform(x, [0, stampTriggerDist, stampTriggerDist * 2], [0, 0.3, 1])
  const skipOpacity = useTransform(x, [0, -stampTriggerDist, -stampTriggerDist * 2], [0, 0.3, 1])

  useEffect(() => {
    if (item.animateInFrom && containerW > 0) {
      const startX =
        item.animateInFrom === "right" ? containerW * 1.5 : item.animateInFrom === "left" ? -containerW * 1.5 : 0

      x.set(startX)
      y.set(40)
      cardOpacity.set(0)
      puffScale.set(1.15)

      animate(x, 0, { type: "spring", stiffness: 450, damping: 35 })
      animate(y, 0, { type: "spring", stiffness: 450, damping: 35 })
      animate(cardOpacity, 1, { duration: 0.3, ease: "easeOut" })
      animate(puffScale, 1, { duration: 0.3, ease: "easeOut" })
    }
  }, [cardOpacity, containerW, item.animateInFrom, item.id, puffScale, x, y])

  const inputX = [-(containerW || 300) / 2, 0, (containerW || 300) / 2]
  const rotate = stackRotation
  const railOffsetY = useTransform(x, inputX, [24, 0, 24])
  const displayY = useTransform(() => y.get() + railOffsetY.get() + stackY)
  const baseScale = useTransform(x, inputX, [0.97, 1, 0.97])
  const scale = useTransform(() => baseScale.get() * puffScale.get())

  const abort = useCallback(() => {
    if (disabled || busyRef.current) return
    animate(x, 0, SNAP)
    animate(y, 0, SNAP)
    animate(cardOpacity, 1, SNAP)
    animate(puffScale, 1, SNAP)
  }, [busyRef, cardOpacity, disabled, puffScale, x, y])

  const flyOut = useCallback((dir: SwipeDir, specificDecision?: SwipeDecision) => {
    if (disabled || busyRef.current || !containerW) return
    if (canSwipeDirection && !canSwipeDirection(dir)) {
      abort()
      return
    }
    busyRef.current = true

    const dist = containerW * 1.5
    const tx = dir === "right" ? dist : dir === "left" ? -dist : 0
    const ty = dir === "down" ? dist : dir === "up" ? -dist : 40
    const shouldPuff = Boolean(specificDecision && specificDecision.strength > 0.4)

    animate(x, tx, { duration: EXIT_DURATION, ease: EXIT_EASE })
    animate(y, ty, { duration: EXIT_DURATION, ease: EXIT_EASE })

    if (shouldPuff) {
      animate(puffScale, 1.15, { duration: EXIT_DURATION, ease: "easeOut" })
    }

    animate(cardOpacity, 0, {
      duration: EXIT_DURATION * 0.8,
      ease: "easeOut",
      onComplete: () => {
        const decision =
          specificDecision ??
          ({
            dir,
            strength: 1,
            velocityNorm: 0,
            score: 1,
            offsetX: tx,
            offsetY: ty,
            angleRad: 0,
            angleDeg: 0,
          } satisfies SwipeDecision)

        onCommit(decision)
        busyRef.current = false
      },
    })
  }, [abort, busyRef, canSwipeDirection, cardOpacity, containerW, disabled, onCommit, puffScale, x, y])

  useImperativeHandle(ref, () => ({ swipe: flyOut }), [flyOut])

  const onDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const decision = computeDecision({
      offsetX: info.offset.x,
      offsetY: info.offset.y,
      velocityX: info.velocity.x,
      velocityY: info.velocity.y,
      containerW,
      containerH,
      cfg: commitConfig,
    })

    if (decision && (decision.dir === "left" || decision.dir === "right")) {
      flyOut(decision.dir, decision)
      return
    }

    abort()
  }, [abort, commitConfig, containerH, containerW, flyOut])

  return (
    <motion.div
      style={{
        zIndex: 10,
        x,
        y: displayY,
        rotate,
        scale,
        opacity: cardOpacity,
        willChange: "transform, opacity",
        touchAction: "none",
        cursor: disabled ? "default" : "grab",
      }}
      drag={disabled ? false : "x"}
      dragDirectionLock
      dragElastic={0.5}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      onPointerCancel={abort}
      className="absolute inset-0"
    >
      {render(item)}

      <motion.div
        style={{ opacity: fundOpacity }}
        className="pointer-events-none absolute left-4 top-10 z-20 flex rotate-[-10deg] items-center rounded-lg border-[2px] border-emerald-500 bg-emerald-500/20 px-2 py-1 backdrop-blur-md min-[380px]:top-16 min-[380px]:rounded-xl min-[380px]:border-[3px] min-[380px]:px-3 min-[380px]:py-1.5 sm:left-8 sm:border-[4px] sm:px-5 sm:py-2"
      >
        <span className="text-base font-black leading-none tracking-widest text-emerald-500 min-[380px]:text-xl sm:text-3xl">
          FUND
        </span>
      </motion.div>

      <motion.div
        style={{ opacity: skipOpacity }}
        className="pointer-events-none absolute right-4 top-10 z-20 flex rotate-[10deg] items-center rounded-lg border-[2px] border-rose-500 bg-rose-500/20 px-2 py-1 backdrop-blur-md min-[380px]:top-16 min-[380px]:rounded-xl min-[380px]:border-[3px] min-[380px]:px-3 min-[380px]:py-1.5 sm:right-8 sm:border-[4px] sm:px-5 sm:py-2"
      >
        <span className="text-base font-black leading-none tracking-widest text-rose-500 min-[380px]:text-xl sm:text-3xl">
          SKIP
        </span>
      </motion.div>
    </motion.div>
  )
}) as <T>(props: TopCardProps<T> & { ref?: React.Ref<SwipeStackHandle> }) => ReactNode

type SwipeStackProps<T> = {
  items: SwipeItem<T>[]
  busyRef: MutableRefObject<boolean>
  onCommit: (decision: SwipeDecision) => void
  canSwipeDirection?: (dir: SwipeDir) => boolean
  renderCard: (item: SwipeItem<T>, isTop: boolean) => ReactNode
  disabled?: boolean
  rotationsEnabled?: boolean
  className?: string
  visible?: number
  stackRotations?: readonly number[]
  stackYs?: readonly number[]
  commitConfig?: CommitConfig
  visualDepth?: number
}

const DEFAULT_ROTATIONS = [0, -2, 2] as const
const DEFAULT_YS = [0, 0, 0] as const

export const SwipeStack = forwardRef(function SwipeStackInner<T>(
  {
    items,
    busyRef,
    onCommit,
    canSwipeDirection,
    renderCard,
    disabled = false,
    rotationsEnabled = true,
    className,
    visible = 4,
    visualDepth = 2,
    stackRotations = DEFAULT_ROTATIONS,
    stackYs = DEFAULT_YS,
    commitConfig = { minStrengthToCommit: 0.2, offsetWeight: 1, velocityWeight: 0.6, angleGateDeg: 80 },
  }: SwipeStackProps<T>,
  ref: React.Ref<SwipeStackHandle>,
) {
  const { ref: frameRef, rect } = useMeasureRect<HTMLDivElement>()
  const topCardRef = useRef<SwipeStackHandle>(null)

  useImperativeHandle(ref, () => ({
    swipe: (dir) => topCardRef.current?.swipe(dir),
  }), [])

  const visibleItems = useMemo(() => items.slice(0, visible), [items, visible])
  const stack = useMemo(() => {
    const effectiveRotations = rotationsEnabled ? stackRotations : [0]

    return visibleItems.map((item, index) => {
      const rotationPhase = item.absoluteIndex % effectiveRotations.length
      const yPhase = item.absoluteIndex % stackYs.length
      return {
        item,
        index,
        rot: effectiveRotations[rotationPhase] ?? 0,
        y: stackYs[yPhase] ?? 0,
      }
    })
  }, [rotationsEnabled, stackRotations, stackYs, visibleItems])

  const visualStack = useMemo(() => stack.slice(0, Math.max(1, visualDepth)), [stack, visualDepth])

  return (
    <div
      ref={frameRef}
      className={className ?? "relative w-full max-w-[340px] flex-1 select-none min-[380px]:aspect-[5/7] sm:max-w-[380px]"}
    >
      {visualStack.map(({ item, index, rot, y }) => {
        const isTop = index === 0
        if (isTop) {
          return (
            <TopSwipeCard
              key={item.id}
              ref={topCardRef}
              item={item}
              stackRotation={rot}
              stackY={y}
              containerW={rect.width}
              containerH={rect.height}
              busyRef={busyRef}
              commitConfig={commitConfig}
              onCommit={onCommit}
              canSwipeDirection={canSwipeDirection}
              disabled={disabled}
              render={(entry) => renderCard(entry, true)}
            />
          )
        }

        return (
          <div
            key={item.id}
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: 10 - index, transform: `translateY(${y}px) rotate(${rot}deg)` }}
          >
            {renderCard(item, false)}
          </div>
        )
      }).reverse()}
    </div>
  )
}) as <T>(props: SwipeStackProps<T> & { ref?: React.Ref<SwipeStackHandle> }) => ReactNode
