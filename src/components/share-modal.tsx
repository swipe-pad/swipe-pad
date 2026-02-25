"use client"

import { useState } from "react"
import { X, Share2, Copy, MessageSquare, Twitter } from "lucide-react"
import type { Project } from "@/lib/useConvexData"
import { openExternalUrl } from "@/lib/external-links"
import { getCategoryFallbackImage } from "@/lib/utils"

// Add Telegram icon component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

interface ShareModalProps {
  project: Project
  projectPathId?: string
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ project, projectPathId, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  // Generate share content
  const projectKey = projectPathId || project.routeId
  const origin = typeof window !== "undefined" ? window.location.origin : "https://swipepad.app"
  const shareTitle = `Support ${project.name} on SwipePad`
  const shareText = `Check out ${project.name} on SwipePad and help support their work!`
  const shareUrl = `${origin}/p/${encodeURIComponent(projectKey)}`

  // Handle copy to clipboard
  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setShareStatus("Failed to copy link")
    }
  }

  // Handle external share
  const handleExternalShare = (platform: string) => {
    try {
      let shareLink = ""

      switch (platform) {
        case "twitter":
          shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText,
          )}&url=${encodeURIComponent(shareUrl)}`
          break
        case "telegram":
          shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
          break
        default:
          if (navigator.share) {
            navigator
              .share({
                title: shareTitle,
                text: shareText,
                url: shareUrl,
              })
              .then(() => setShareStatus("Shared successfully"))
              .catch((error) => {
                console.error("Error sharing:", error)
                setShareStatus("Failed to share")
              })
            return
          }
      }

      if (shareLink) {
        openExternalUrl(shareLink)
      }
    } catch (error) {
      console.error("Error sharing:", error)
      setShareStatus("Failed to share")
    }
  }

  // Handle MiniPay internal share
  const handleMiniPayShare = () => {
    try {
      // Mock MiniPay internal sharing
      console.log("Sharing inside MiniPay:", {
        project: project.name,
        text: shareText,
        url: shareUrl,
      })

      setShareStatus("Shared with MiniPay contacts")
      setTimeout(() => setShareStatus(null), 2000)
    } catch (error) {
      console.error("Error sharing in MiniPay:", error)
      setShareStatus("Failed to share in MiniPay")
    }
  }

  if (!isOpen) return null

  return (
    <div className="
      fixed inset-0 z-110 flex items-center justify-center bg-black/70 p-4
    " onClick={onClose}>
      <div className="
        surface-panel-strong w-full max-w-md rounded-2xl border
        border-surface-border p-6 shadow-2xl
      " onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-xl font-bold">Share Project</h3>
          <button onClick={onClose} className="
            text-gray-400
            hover:text-white
          ">
            <X className="size-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="mb-4 flex items-center space-x-3">
            <img
              src={project.imageUrl || getCategoryFallbackImage(project.category)}
              alt={project.name}
              className="size-12 rounded-md object-cover"
            />
            <div>
              <h4 className="font-medium">{project.name}</h4>
              <p className="text-sm text-gray-400">{project.category}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-3 text-sm font-medium">Share inside MiniPay</h4>
            <button
              onClick={handleMiniPayShare}
              className="
                flex w-full items-center justify-center rounded-lg bg-[#677FEB]
                py-3 font-medium text-white transition-colors
                hover:bg-[#5A6FD3]
              "
            >
              <MessageSquare className="mr-2 size-4" /> Share with MiniPay Contacts
            </button>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">Share outside MiniPay</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleExternalShare("twitter")}
                className="
                  flex flex-col items-center justify-center rounded-lg
                  bg-gray-800 p-3 transition-colors
                  hover:bg-gray-700
                "
              >
                <Twitter className="mb-1 size-6" />
                <span className="text-xs">Twitter</span>
              </button>
              <button
                onClick={() => handleExternalShare("telegram")}
                className="
                  flex flex-col items-center justify-center rounded-lg
                  bg-gray-800 p-3 transition-colors
                  hover:bg-gray-700
                "
              >
                <TelegramIcon className="mb-1 size-6" />
                <span className="text-xs">Telegram</span>
              </button>
              <button
                onClick={() => handleExternalShare("other")}
                className="
                  flex flex-col items-center justify-center rounded-lg
                  bg-gray-800 p-3 transition-colors
                  hover:bg-gray-700
                "
              >
                <Share2 className="mb-1 size-6" />
                <span className="text-xs">More</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium">Copy link</h4>
            <div className="flex items-center">
              <div className="
                flex-1 truncate rounded-l-lg bg-gray-800 px-3 py-2 text-sm
                text-gray-300
              ">{shareUrl}</div>
              <button
                onClick={handleCopyLink}
                className={`
                  rounded-r-lg px-3 py-2 transition-colors
                  ${
                  copied ? "bg-green-600 text-white" : `
                    bg-gray-700 text-white
                    hover:bg-gray-600
                  `
                }
                `}
              >
                {copied ? "Copied!" : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {shareStatus && <div className="
          mt-4 rounded-lg bg-gray-800 p-2 text-center text-sm
        ">{shareStatus}</div>}
      </div>
    </div>
  )
}
