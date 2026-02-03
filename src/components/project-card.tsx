"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Heart, MessageCircle, Flag, Zap, ExternalLink, X, ThumbsUp } from "lucide-react"
import { BoostModal } from "@/components/boost-modal"
import { ShareModal } from "@/components/share-modal"
import { ReportModal } from "@/components/report-modal"
import type { Project } from "@/lib/data"
import type { DonationAmount, StableCoin } from "@/components/amount-selector"

interface ProjectCardProps {
  project: Project
  viewMode?: "swipe" | "category"
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDonate?: (amount?: number) => void
  onShare?: () => void
  onBoost?: (amount: number) => void
  donationAmount?: DonationAmount
  donationCurrency?: StableCoin
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
  viewMode = "swipe",
  onSwipeLeft,
  onSwipeRight,
  onDonate,
  onShare,
  onBoost,
  donationAmount,
  donationCurrency,
}: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(project.userHasLiked || false)
  const [likeCount, setLikeCount] = useState(project.likes || 0)
  const [showBoostModal, setShowBoostModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Touch/swipe handling
  const cardRef = useRef<HTMLDivElement>(null)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragThreshold] = useState(50)

  // Separate handlers for heart and like button
  const handleHeartLike = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  const handleProjectLike = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log("Project liked:", project.name)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleBoost = (amount: number) => {
    if (onBoost) {
      onBoost(amount)
    }
  }

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (url === "NA") {
      return
    }
    window.open(url, "_blank", "noopener,noreferrer")
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

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== "swipe") return
    const touch = e.touches[0]
    setStartX(touch.clientX)
    setCurrentX(touch.clientX)
    setIsDragging(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode !== "swipe") return
    const touch = e.touches[0]
    setCurrentX(touch.clientX)
    const diff = touch.clientX - startX

    if (Math.abs(diff) > 10) {
      setIsDragging(true)
    }

    if (cardRef.current && isDragging) {
      cardRef.current.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging || viewMode !== "swipe") {
      if (cardRef.current) {
        cardRef.current.style.transform = ""
      }
      setIsDragging(false)
      return
    }

    const diff = currentX - startX

    if (cardRef.current) {
      cardRef.current.style.transform = ""
    }

    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (diff < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    setStartX(0)
    setCurrentX(0)
    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== "swipe") return
    e.preventDefault()
  }

  const getImageSrc = () => {
    if (imageError || !project.imageUrl || project.imageUrl === "NA") {
      return `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(project.name + " " + project.category)}`
    }
    return project.imageUrl
  }

  const cardContent = (
    <div
      ref={cardRef}
      className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Project Image */}
      <div className="relative h-48 bg-gray-700">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFD600]"></div>
          </div>
        )}

        <img
          src={getImageSrc() || "/placeholder.svg"}
          alt={project.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? "opacity-0" : "opacity-100"}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          draggable={false}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">{project.category}</span>
        </div>

        {/* Boost Badge */}
        {project.boostAmount && project.boostAmount > 0 && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Boosted</span>
            </div>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{project.name}</h3>
            <p className="text-gray-300 text-sm line-clamp-2 mb-3">
              {project.description || "No description available"}
            </p>
          </div>
        </div>

        {/* Social Links - Show based on availability */}
        <div className="flex items-center space-x-3 mb-4 flex-wrap gap-y-2">
          {project.github && (
            <button
              onClick={(e) => handleExternalLink(e, project.github!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="GitHub"
            >
              <GitHubIcon className="w-4 h-4" />
              <span className="text-xs">GitHub</span>
            </button>
          )}

          {project.linkedin && (
            <button
              onClick={(e) => handleExternalLink(e, project.linkedin!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span className="text-xs">LinkedIn</span>
            </button>
          )}

          {project.farcaster && (
            <button
              onClick={(e) => handleExternalLink(e, project.farcaster!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="Farcaster"
            >
              <FarcasterIcon className="w-4 h-4" />
              <span className="text-xs">Farcaster</span>
            </button>
          )}

          {project.website && project.website !== "NA" && (
            <button
              onClick={(e) => handleExternalLink(e, project.website!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="Website"
            >
              <WebsiteIcon className="w-4 h-4" />
              <span className="text-xs">Website</span>
            </button>
          )}

          {project.twitter && project.twitter !== "NA" && (
            <button
              onClick={(e) => handleExternalLink(e, project.twitter!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="Twitter"
            >
              <XIcon className="w-4 h-4" />
              <span className="text-xs">Twitter</span>
            </button>
          )}

          {project.discord && project.discord !== "NA" && (
            <button
              onClick={(e) => handleExternalLink(e, project.discord!)}
              className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors"
              title="Discord"
            >
              <DiscordIcon className="w-4 h-4" />
              <span className="text-xs">Discord</span>
            </button>
          )}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleHeartLike}
              className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-400 text-red-400" : ""}`} />
              <span className="text-xs">{likeCount}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={(e) => handleButtonClick(e, () => console.log("Comment clicked"))}
              className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">{project.comments}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={(e) => handleButtonClick(e, () => setShowShareModal(true))}
              className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs">Share</span>
            </button>

            {/* Report Button */}
            <button
              onClick={(e) => handleButtonClick(e, () => setShowReportModal(true))}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* Boost Button */}
          <button
            onClick={(e) => handleButtonClick(e, () => setShowBoostModal(true))}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg font-medium text-xs flex items-center space-x-1 transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Boost</span>
          </button>
        </div>

        {/* Swipe Mode Actions */}
        {viewMode === "swipe" && (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={(e) => handleButtonClick(e, () => onSwipeLeft && onSwipeLeft())}
              className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Skip
            </button>
            <button
              onClick={(e) =>
                handleButtonClick(e, () => {
                  handleProjectLike()
                  onSwipeRight && onSwipeRight()
                })
              }
              className="flex-1 py-2 bg-[#FFD600] hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
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
            className="w-full mt-4 py-2 bg-[#FFD600] hover:bg-yellow-500 text-black font-medium rounded-lg transition-colors text-sm"
          >
            Like
          </button>
        )}
      </div>

      {/* Modals */}
      <BoostModal
        isOpen={showBoostModal}
        onClose={() => setShowBoostModal(false)}
        projectName={project.name}
        onBoost={handleBoost}
      />

      {showShareModal && (
        <ShareModal project={project} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          projectName={project.name}
          onSubmit={handleReport}
        />
      )}
    </div>
  )

  if (viewMode === "category") {
    return <div className="flex-shrink-0 w-80">{cardContent}</div>
  }

  return cardContent
}
