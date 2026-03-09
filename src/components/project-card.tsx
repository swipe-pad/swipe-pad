"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { MessageCircle, Flag, Zap, ExternalLink, RotateCcw, X, ThumbsUp } from "lucide-react"
import { BoostModal } from "@/components/boost-modal"
import { ShareModal } from "@/components/share-modal"
import { ReportModal } from "@/components/report-modal"
import { ExternalLinkDialog } from "@/components/external-link-dialog"
import { SafeImage } from "@/components/ui/safe-image"
import type { Project } from "@/lib/useConvexData"
import type { DonationAmount, StableCoin } from "@/components/amount-selector"
import { stripMarkdown } from "@/lib/markdown"
import { normalizeExternalUrl } from "@/lib/external-links"
import { type SwipeDecision } from "@/components/swipe/engine"
import { useSwipeCardController } from "@/components/swipe/use-swipe-card-controller"
import { getCategoryFallbackImage, getProjectImageSrc, getTopLevelCategory, isInvalidProjectImage } from "@/lib/project-taxonomy"

interface ProjectCardProps {
  project: Project
  projectPathId?: string
  className?: string
  viewMode?: "swipe" | "category"
  isLoading?: boolean
  showImageLoader?: boolean
  onSwipeLeft?: (decision?: SwipeDecision) => void
  onSwipeRight?: (decision?: SwipeDecision) => void
  onUndo?: () => void
  onDonate?: (amount?: number) => void
  onShare?: () => void
  onBoost?: (amount: number) => void
  donationAmount?: DonationAmount
  donationCurrency?: StableCoin
  swipeControlMode?: "internal" | "external"
}

function getCategoryBadgeClasses(category: string) {
  const key = category.toLowerCase()

  if (key.includes("builder")) return "border-blue-300/60 bg-blue-500 text-white"
  if (key.includes("eco") || key.includes("climate") || key.includes("regen")) {
    return "border-emerald-300/60 bg-emerald-500 text-white"
  }
  if (key.includes("dapp")) return "border-violet-300/60 bg-violet-500 text-white"
  if (key.includes("defi")) return "border-cyan-300/60 bg-cyan-500 text-slate-900"
  if (key.includes("social")) return "border-pink-300/60 bg-pink-500 text-white"

  return "border-amber-300/60 bg-amber-500 text-slate-900"
}

// Custom X (Twitter) Icon Component
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Website Icon Component
function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

// Discord Icon Component
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

// LinkedIn Icon Component
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

// GitHub Icon Component
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}

// Farcaster Icon Component
function FarcasterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.24 4.32h-3.12v13.44h3.12V4.32zM8.88 4.32H5.76v13.44h3.12V4.32zM2.4 19.68h19.2v-1.92H2.4v1.92zM2.4 2.4v1.92h19.2V2.4H2.4z" />
    </svg>
  )
}

export function ProjectCard({
  project,
  projectPathId,
  className,
  viewMode = "swipe",
  isLoading = false,
  showImageLoader = true,
  onSwipeLeft,
  onSwipeRight,
  onUndo,
  onDonate,
  onBoost,
  swipeControlMode = "internal",
}: ProjectCardProps) {
  type SwipeDirection = "left" | "right"
  const internalSwipeEnabled = viewMode === "swipe" && swipeControlMode === "internal"

  const ENABLE_REPORTS = false
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [externalLinkPreview, setExternalLinkPreview] = useState<{ url: string; label: string } | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const cardRef = useRef<HTMLDivElement>(null)
  const [pressedArrow, setPressedArrow] = useState<SwipeDirection | null>(null)
  const swipeController = useSwipeCardController({
    cardRef,
    enabled: internalSwipeEnabled,
    isLoading,
    resetKey: project.id,
    onSwipe: (direction, decision) => {
      setPressedArrow(null)
      if (direction === "right") {
        onSwipeRight?.(decision)
        return
      }
      onSwipeLeft?.(decision)
    },
  })
  const { isSwipingOut, triggerSwipe, previewDirection, handleDragEnd, snapBack } = swipeController

  useEffect(() => {
    if (!internalSwipeEnabled || isLoading) return

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false
      return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      if (event.repeat || isEditableTarget(event.target) || isSwipingOut || pressedArrow) return

      const direction: SwipeDirection = event.key === "ArrowRight" ? "right" : "left"
      const callback = direction === "right" ? onSwipeRight : onSwipeLeft
      if (!callback) return

      event.preventDefault()
      setPressedArrow(direction)
      previewDirection(direction)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      const direction: SwipeDirection = event.key === "ArrowRight" ? "right" : "left"
      if (pressedArrow !== direction) return

      event.preventDefault()
      triggerSwipe(direction)
    }

    const handleBlur = () => {
      setPressedArrow(null)
      snapBack()
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("blur", handleBlur)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("blur", handleBlur)
    }
  }, [
    isLoading,
    isSwipingOut,
    onSwipeLeft,
    onSwipeRight,
    pressedArrow,
    snapBack,
    triggerSwipe,
    internalSwipeEnabled,
    previewDirection,
  ])

  const handleProjectLike = (e?: React.MouseEvent) => {
    if (isLoading) return
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log("Project liked:", project.name)
  }

  const handleImageError = () => {
    const key = project.imageUrl
    setFailedImages((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const handleImageLoad = () => {
    setLoadedImages((prev) => {
      if (prev.has(imageSrc)) return prev
      const next = new Set(prev)
      next.add(imageSrc)
      return next
    })
  }

  const handleBoost = (amount: number) => {
    if (onBoost) {
      onBoost(amount)
    }
  }

  const handleExternalLink = (e: React.MouseEvent, url: string, label: string) => {
    e.preventDefault()
    e.stopPropagation()
    const safeUrl = normalizeExternalUrl(url)
    if (!safeUrl) return
    setExternalLinkPreview({ url: safeUrl, label })
  }

  const handleReport = (reason: string, customReason?: string) => {
    console.log(`Reporting ${project.name}: ${reason}`, customReason)
    alert(`Thank you for your report. We'll review ${project.name} for: ${reason}`)
  }

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    action()
  }

  const getImageSrc = () => {
    const categoryInput = { category: project.category, source: project.source }
    if (failedImages.has(project.imageUrl) || isInvalidProjectImage(project.imageUrl)) {
      return getCategoryFallbackImage(categoryInput)
    }

    return getProjectImageSrc(project.imageUrl, categoryInput)
  }

  const imageSrc = getImageSrc()
  const imageLoading = !isLoading && !loadedImages.has(imageSrc)
  const topLevelCategory = getTopLevelCategory({ category: project.category, source: project.source })

  const cardContent = (
    <motion.div
      ref={cardRef}
      style={{
        x: swipeController.x,
        y: swipeController.y,
        rotate: swipeController.rotate,
        opacity: swipeController.cardOpacity,
        scale: swipeController.scale,
        willChange: "transform, opacity",
      }}
      className={`
        relative overflow-hidden select-none
        ${viewMode === "swipe"
          ? `
            z-100 h-full rounded-[28px] border border-surface-border
            bg-[#101a2f] shadow-[0_24px_80px_rgba(0,0,0,0.55)]
          `
          : "rounded-2xl bg-gray-800 shadow-lg"
        }
        ${className ?? ""}
      `}
      drag={internalSwipeEnabled && !isLoading ? "x" : false}
      dragDirectionLock
      dragElastic={0.5}
      dragMomentum={false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={internalSwipeEnabled ? handleDragEnd : undefined}
      onPointerCancel={internalSwipeEnabled ? snapBack : undefined}
    >
      {internalSwipeEnabled && (
        <>
          <motion.div
            className="
              pointer-events-none absolute inset-0 z-10 bg-green-500/10
            "
            style={{ opacity: swipeController.likeOverlayOpacity }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 bg-red-500/10"
            style={{ opacity: swipeController.skipOverlayOpacity }}
          />

          <motion.div
            className="
              pointer-events-none absolute top-8 left-8 z-50 -rotate-12
              transform rounded-lg border-4 border-white bg-green-500/90 px-4
              py-2 text-2xl font-black tracking-wide text-white shadow-xl
              transition-opacity
            "
            style={{ opacity: swipeController.likeStampOpacity }}
          >
            LIKE
          </motion.div>
          <motion.div
            className="
              pointer-events-none absolute top-8 right-8 z-50 rotate-12
              transform rounded-lg border-4 border-white bg-red-500/90 px-4 py-2
              text-2xl font-black tracking-wide text-white shadow-xl
              transition-opacity
            "
            style={{ opacity: swipeController.skipStampOpacity }}
          >
            SKIP
          </motion.div>
        </>
      )}

      {/* Project Image */}
      <div className={`
        relative bg-gray-700
        ${viewMode === "swipe" ? "h-[68%]" : `h-48`}
      `}>
        {!isLoading && showImageLoader && imageLoading && (
          <div className="
            absolute inset-0 flex items-center justify-center bg-gray-700
          ">
            <div className="
              size-8 animate-spin rounded-full border-b-2 border-[#FFD600]
            "></div>
          </div>
        )}

        {isLoading ? (
          <div className="
            absolute inset-0 animate-pulse bg-linear-to-br from-[#202c47]
            via-[#1a253f] to-[#141d34]
          " />
        ) : (
          <SafeImage
            src={imageSrc}
            alt={project.name}
            fill
            className={`
              object-cover transition-opacity duration-300
              ${showImageLoader && imageLoading ? `opacity-0` : `opacity-100`}
            `}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading={viewMode === "swipe" ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            draggable={false}
          />
        )}

        {/* Category Badge */}
        {isLoading ? (
          <div className="
            absolute top-3 left-3 h-6 w-24 animate-pulse rounded-full
            bg-white/20
          " />
        ) : (
          <div className="absolute top-3 left-3">
            <span
              className={`
                rounded-full border px-2 py-1 text-[11px] font-bold
                tracking-wide uppercase
                ${getCategoryBadgeClasses(topLevelCategory)}
              `}
            >
              {topLevelCategory}
            </span>
          </div>
        )}

        {/* Boost Badge */}
        {!isLoading && (project.boostAmount ?? 0) > 0 && (
          <div className="absolute top-3 right-3">
            <div className="
              flex items-center space-x-1 rounded-full bg-primary px-2 py-1
              text-xs font-bold text-primary-foreground
            ">
              <Zap className="size-3 fill-current" />
              <span>Boosted</span>
            </div>
          </div>
        )}

        {viewMode === "swipe" && swipeControlMode === "internal" && (
          <div className="
            pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[44%]
            bg-linear-to-t from-[#050a16]/95 via-[#0b1327]/82 to-transparent
          " />
        )}
      </div>

      {/* Project Info */}
      <div className={viewMode === "swipe" ? `
        absolute inset-x-0 bottom-0 z-20 rounded-t-3xl border-t
        border-surface-border bg-[#0b1327]/84 p-4 backdrop-blur-xl
      ` : `p-4`}>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            {isLoading ? (
              <>
                <div className="
                  mb-2 h-6 w-2/3 animate-pulse rounded-sm bg-white/20
                " />
                <div className="
                  mb-1 h-4 w-full animate-pulse rounded-sm bg-white/10
                " />
                <div className="
                  mb-3 h-4 w-5/6 animate-pulse rounded-sm bg-white/10
                " />
              </>
            ) : (
              <>
                <h3 className="mb-1 line-clamp-1 text-lg font-bold text-white">{project.name}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-gray-300">
                  {stripMarkdown(project.description) || "No description available"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Social Links + Boost */}
        <div className={`
          mb-4 flex items-center
          ${viewMode === "swipe" ? `justify-between` : `justify-start`}
        `}>
          <div className={`
            flex flex-wrap items-center gap-y-2
            ${viewMode === "swipe" ? `gap-x-3` : `space-x-3`}
          `}>
            {!isLoading && project.github && (
              <button onClick={(e) => handleExternalLink(e, project.github!, "GitHub")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="GitHub">
                <GitHubIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">GitHub</span>}
              </button>
            )}

            {!isLoading && project.linkedin && (
              <button onClick={(e) => handleExternalLink(e, project.linkedin!, "LinkedIn")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="LinkedIn">
                <LinkedInIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">LinkedIn</span>}
              </button>
            )}

            {!isLoading && project.farcaster && (
              <button onClick={(e) => handleExternalLink(e, project.farcaster!, "Farcaster")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="Farcaster">
                <FarcasterIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">Farcaster</span>}
              </button>
            )}

            {!isLoading && project.website && project.website !== "NA" && (
              <button onClick={(e) => handleExternalLink(e, project.website!, "Website")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="Website">
                <WebsiteIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">Website</span>}
              </button>
            )}

            {!isLoading && project.twitter && project.twitter !== "NA" && (
              <button onClick={(e) => handleExternalLink(e, project.twitter!, "Twitter/X")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="Twitter">
                <XIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">Twitter</span>}
              </button>
            )}

            {!isLoading && project.discord && project.discord !== "NA" && (
              <button onClick={(e) => handleExternalLink(e, project.discord!, "Discord")} className="
                flex items-center space-x-1 text-gray-400 transition-colors
                hover:text-white
              " title="Discord">
                <DiscordIcon className="size-4" />
                {viewMode === "category" && <span className="text-xs">Discord</span>}
              </button>
            )}
          </div>

          {viewMode === "swipe" && (
            <button
              onClick={(e) => handleButtonClick(e, () => {
                if (isLoading) return
                setShowBoostModal(true)
              })}
              disabled={isLoading}
              className="
                relative ml-3 flex shrink-0 items-center space-x-1
                overflow-hidden rounded-full bg-[#4E45D6] px-3 py-1 text-xs
                font-semibold text-white
                shadow-[0_6px_18px_rgba(78,69,214,0.38)] transition-all
                duration-300
                hover:brightness-110
                disabled:cursor-not-allowed disabled:opacity-55
              "
            >
              <span
                className="
                  pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
                  skew-x-[-20deg]
                  animate-[boost-sheen_3.8s_ease-in-out_infinite] bg-white/30
                  blur-[1px]
                "
              />
              <Zap className="
                size-4 fill-current text-primary
                drop-shadow-[0_0_8px_var(--color-primary)]
              " />
              <span>Boost</span>
            </button>
          )}
        </div>

        {/* Interaction Buttons */}
        <div className={`
          items-center justify-between
          ${viewMode === "swipe" ? `mb-3 flex` : `flex`}
        `}>
          <div className="flex items-center space-x-4">
            {/* Comment Button */}
            {viewMode === "category" && (
              <button
                onClick={(e) => handleButtonClick(e, () => console.log("Comment clicked"))}
                className="
                  flex items-center space-x-1 text-gray-400 transition-colors
                  hover:text-blue-400
                "
              >
                <MessageCircle className="size-5" />
                <span className="text-xs">{project.comments}</span>
              </button>
            )}

            {/* Share Button */}
            {viewMode === "category" && (
              <button
                onClick={(e) => handleButtonClick(e, () => setShowShareModal(true))}
                className="
                  flex items-center space-x-1 text-gray-400 transition-colors
                  hover:text-green-400
                "
              >
                <ExternalLink className="size-4" />
                <span className="text-xs">Share</span>
              </button>
            )}

            {/* Report Button */}
            {ENABLE_REPORTS ? (
              <button
                onClick={(e) => handleButtonClick(e, () => setShowReportModal(true))}
                className="
                  text-gray-500 transition-colors
                  hover:text-red-400
                "
              >
                <Flag className="size-4" />
              </button>
            ) : null}
          </div>

          {viewMode === "category" && (
            <button
              onClick={(e) => handleButtonClick(e, () => setShowBoostModal(true))}
              className="
                flex items-center space-x-1 rounded-lg bg-[#4E45D6] px-2 py-1
                text-xs font-medium text-white transition-colors
                hover:bg-[#433ac0]
              "
            >
              <Zap className="
                size-4 text-[#F9DE4B]
                drop-shadow-[0_0_6px_rgba(249,222,75,0.55)]
              " />
              <span>Boost</span>
            </button>
          )}
        </div>

        {/* Swipe Mode Actions */}
        {viewMode === "swipe" && swipeControlMode === "internal" && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={(e) => handleButtonClick(e, () => {
                if (isLoading) return
                triggerSwipe("left")
              })}
              disabled={isLoading}
              className="
                flex h-12 flex-1 items-center justify-center rounded-full border
                border-zinc-600/50 bg-zinc-800 text-sm font-medium text-white
                transition-colors
                hover:bg-zinc-700
                disabled:cursor-not-allowed disabled:opacity-65
              "
            >
              <X className="mr-2 size-4" />
              Skip
            </button>

            <button
              onClick={(e) => handleButtonClick(e, () => onUndo && onUndo())}
              disabled={isLoading || !onUndo}
              className={`
                flex size-12 items-center justify-center rounded-full border
                border-zinc-600/50 transition-colors
                ${
                onUndo
                  ? `
                    bg-zinc-800 text-zinc-300
                    hover:bg-zinc-700 hover:text-white
                  `
                  : "cursor-not-allowed bg-zinc-900/70 text-zinc-600"
              }
              `}
              aria-label="Undo last swipe"
            >
              <RotateCcw className="size-5" />
            </button>

            <button
              onClick={(e) =>
                handleButtonClick(e, () => {
                  if (isLoading) return
                  handleProjectLike()
                  triggerSwipe("right")
                })
              }
              disabled={isLoading}
              className="
                flex h-12 flex-1 items-center justify-center rounded-full
                bg-[#F9DE4B] text-sm font-semibold text-black transition-colors
                hover:bg-[#f2cb22]
                disabled:cursor-not-allowed disabled:opacity-65
              "
            >
              <ThumbsUp className="mr-2 size-4" />
              Like
            </button>
          </div>
        )}

        {/* Category Mode Actions */}
        {viewMode === "category" && onDonate && (
          <button
            onClick={(e) =>
              handleButtonClick(e, () => {
                handleProjectLike()
                onDonate()
              })
            }
            className="
              mt-4 w-full rounded-lg bg-[#FFD600] py-2 text-sm font-medium
              text-black transition-colors
              hover:bg-yellow-500
            "
          >
            Like
          </button>
        )}
      </div>

      {/* Modals */}
      {!isLoading ? (
        <BoostModal
          isOpen={showBoostModal}
          onClose={() => setShowBoostModal(false)}
          projectName={project.name}
          onBoost={handleBoost}
        />
      ) : null}

      {showShareModal && (
        <ShareModal
          project={project}
          projectPathId={projectPathId}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {ENABLE_REPORTS && showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          projectName={project.name}
          onSubmit={handleReport}
        />
      )}

      {externalLinkPreview ? (
        <ExternalLinkDialog
          isOpen={Boolean(externalLinkPreview)}
          onClose={() => setExternalLinkPreview(null)}
          url={externalLinkPreview.url}
          label={externalLinkPreview.label}
        />
      ) : null}
    </motion.div>
  )

  if (viewMode === "category") {
    return <div className="w-80 shrink-0">{cardContent}</div>
  }

  return cardContent
}
