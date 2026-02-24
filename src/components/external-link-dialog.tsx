"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

import { getExternalHostname, isUnsafeExternalUrl, openExternalUrl } from "@/lib/external-links"

interface ExternalLinkDialogProps {
  isOpen: boolean
  onClose: () => void
  url: string
  label: string
}

type LinkPreview = {
  url: string
  title: string
  description: string
  image: string | null
  fallbackImage: string | null
}

export function ExternalLinkDialog({ isOpen, onClose, url, label }: ExternalLinkDialogProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null)
  const [hasTriedFallbackImage, setHasTriedFallbackImage] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const controller = new AbortController()

    setPreview(null)
    setPreviewImageSrc(null)
    setHasTriedFallbackImage(false)
    setIsLoadingPreview(true)

    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load preview")
        }
        const data = (await response.json()) as LinkPreview
        setPreview(data)
        setPreviewImageSrc(data.image ?? data.fallbackImage)
      })
      .catch(() => {
        setPreview(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPreview(false)
        }
      })

    return () => controller.abort()
  }, [isOpen, url])

  if (!isOpen) return null

  const host = getExternalHostname(url)
  const isUnsafe = isUnsafeExternalUrl(url)
  const displayUrl = preview?.url || url

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="surface-panel-strong w-full max-w-md rounded-2xl border border-surface-border p-5 shadow-2xl">
        <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground">EXTERNAL LINK</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Open external link?</h3>
        <p className="mt-2 text-sm text-gray-300">
          You are leaving SwipePad and opening {label} in a new tab.
        </p>

        <div className="mt-4 rounded-xl border border-surface-border bg-surface-2 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">Destination</p>
          <p className="mt-1 line-clamp-1 text-sm text-white">{host}</p>
          <p className="mt-1 break-all text-[11px] text-gray-400">{displayUrl}</p>
        </div>

        <div className="mt-3 h-[172px] overflow-hidden rounded-xl border border-surface-border bg-surface-2">
          {isLoadingPreview ? (
            <div className="flex h-full animate-pulse gap-3 p-3">
              <div className="h-16 w-16 shrink-0 rounded-md bg-white/10" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-white/15" />
                <div className="mt-2 h-3 w-full rounded bg-white/10" />
                <div className="mt-1 h-3 w-5/6 rounded bg-white/10" />
                <div className="mt-1 h-3 w-4/6 rounded bg-white/10" />
              </div>
            </div>
          ) : preview ? (
            <div className="flex h-full gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageSrc ?? "/placeholder.svg"}
                alt={preview.title}
                className="h-16 w-16 shrink-0 rounded-md object-cover"
                onError={() => {
                  if (!hasTriedFallbackImage && preview?.fallbackImage && previewImageSrc !== preview.fallbackImage) {
                    setHasTriedFallbackImage(true)
                    setPreviewImageSrc(preview.fallbackImage)
                    return
                  }
                  setPreviewImageSrc("/placeholder.svg")
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-white">{preview.title}</p>
                <p className="mt-1 line-clamp-3 text-xs text-gray-300">{preview.description}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 text-xs text-gray-400">Preview metadata not available for this destination.</div>
          )}
        </div>

        {isUnsafe ? (
          <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            This destination looks unsafe (local/private network address). Opening is blocked.
          </div>
        ) : null}

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-surface-border bg-surface-2 px-3 py-2 text-sm text-white transition-colors hover:bg-surface-3"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (isUnsafe) return
              openExternalUrl(url)
              onClose()
            }}
            disabled={isUnsafe}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <ExternalLink className="size-4" />
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
