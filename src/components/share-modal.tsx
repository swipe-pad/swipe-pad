"use client"

import { useState } from "react"
import { X, Share2, Copy, MessageSquare, Twitter } from "lucide-react"
import type { Project } from "@/lib/data"

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
  isOpen: boolean
  onClose: () => void
}

export function ShareModal({ project, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  // Generate share content
  const shareTitle = `Support ${project.name} on SwipePad`
  const shareText = `Check out ${project.name} on SwipePad and help support their work!`
  const shareUrl = `https://swipepad.app/project/${project.id}`

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
        window.open(shareLink, "_blank", "noopener,noreferrer")
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F2732] rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Share Project</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={project.imageUrl || `/placeholder.svg?height=48&width=48&query=${encodeURIComponent(project.name)}`}
              alt={project.name}
              className="w-12 h-12 object-cover rounded-md"
            />
            <div>
              <h4 className="font-medium">{project.name}</h4>
              <p className="text-sm text-gray-400">{project.category}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Share inside MiniPay</h4>
            <button
              onClick={handleMiniPayShare}
              className="w-full py-3 bg-[#677FEB] hover:bg-[#5A6FD3] text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Share with MiniPay Contacts
            </button>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Share outside MiniPay</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleExternalShare("twitter")}
                className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Twitter className="w-6 h-6 mb-1" />
                <span className="text-xs">Twitter</span>
              </button>
              <button
                onClick={() => handleExternalShare("telegram")}
                className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <TelegramIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Telegram</span>
              </button>
              <button
                onClick={() => handleExternalShare("other")}
                className="flex flex-col items-center justify-center p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Share2 className="w-6 h-6 mb-1" />
                <span className="text-xs">More</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Copy link</h4>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-800 rounded-l-lg py-2 px-3 text-sm text-gray-300 truncate">{shareUrl}</div>
              <button
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-r-lg transition-colors ${
                  copied ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
                }`}
              >
                {copied ? "Copied!" : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {shareStatus && <div className="mt-4 p-2 bg-gray-800 text-center rounded-lg text-sm">{shareStatus}</div>}
      </div>
    </div>
  )
}
