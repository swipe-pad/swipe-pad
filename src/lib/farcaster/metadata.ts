import type { Metadata } from "next"

import { getAppUrl } from "@/lib/farcaster/config"

export type FarcasterEmbedPayload = {
  version: "1"
  imageUrl: string
  button: {
    title: string
    action: {
      type: "launch_miniapp"
      name: string
      url: string
      splashImageUrl?: string
      splashBackgroundColor?: string
    }
  }
}

type FarcasterMetadataInput = {
  canonicalPath: string
  title: string
  description: string
  imageUrl: string
  buttonTitle?: string
  splashImageUrl?: string
  splashBackgroundColor?: string
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

function toAbsoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `${getAppUrl()}${normalizePath(value)}`
}

export function buildMiniAppEmbed({
  canonicalPath,
  imageUrl,
  buttonTitle = "Open SwipePad",
  splashImageUrl,
  splashBackgroundColor,
}: Omit<FarcasterMetadataInput, "title" | "description">): FarcasterEmbedPayload {
  const appUrl = getAppUrl()
  const url = `${appUrl}${normalizePath(canonicalPath)}`

  return {
    version: "1",
    imageUrl: toAbsoluteUrl(imageUrl),
    button: {
      title: buttonTitle,
      action: {
        type: "launch_miniapp",
        name: "SwipePad",
        url,
        ...(splashImageUrl ? { splashImageUrl } : {}),
        ...(splashBackgroundColor ? { splashBackgroundColor } : {}),
      },
    },
  }
}

export function buildFarcasterMetadata(input: FarcasterMetadataInput): Metadata {
  const url = `${getAppUrl()}${normalizePath(input.canonicalPath)}`
  const embed = buildMiniAppEmbed(input)
  const imageUrl = toAbsoluteUrl(input.imageUrl)

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [imageUrl],
    },
    other: {
      "fc:miniapp": JSON.stringify(embed),
      "fc:frame": JSON.stringify(embed),
    },
  }
}
