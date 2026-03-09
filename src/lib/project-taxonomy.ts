import { buildImageProxyUrl, isRemoteImageUrl } from "@/lib/image-delivery"

export const TOP_LEVEL_CATEGORIES = ["See All", "Builders", "Eco Projects", "Dapps"] as const

export type TopLevelCategory = Exclude<(typeof TOP_LEVEL_CATEGORIES)[number], "See All">
export type FeedCategory = (typeof TOP_LEVEL_CATEGORIES)[number]

type CategoryInput = {
  category?: string | null
  source?: string | null
}

function normalizeKey(value?: string | null): string {
  return (value ?? "").trim().toLowerCase()
}

export function getTopLevelCategory(input: CategoryInput | string): TopLevelCategory {
  const category = typeof input === "string" ? input : input.category
  const source = typeof input === "string" ? "" : input.source
  const categoryKey = normalizeKey(category)
  const sourceKey = normalizeKey(source)

  if (sourceKey === "karma" || categoryKey.includes("dapp") || categoryKey.includes("defi") || categoryKey.includes("app")) {
    return "Dapps"
  }

  if (
    categoryKey.includes("eco") ||
    categoryKey.includes("climate") ||
    categoryKey.includes("regen") ||
    categoryKey.includes("regeneration") ||
    categoryKey.includes("nature") ||
    categoryKey.includes("social impact")
  ) {
    return "Eco Projects"
  }

  return "Builders"
}

export function normalizeProjectCategory(input: CategoryInput | string): TopLevelCategory {
  return getTopLevelCategory(input)
}

export function getCategoryFallbackImage(input: CategoryInput | string): string {
  switch (getTopLevelCategory(input)) {
    case "Builders":
      return "/assets/builders-placeholder.png"
    case "Eco Projects":
      return "/assets/eco-projects-placeholder.png"
    case "Dapps":
      return "/assets/dapps-placeholder.png"
  }
}

export function isInvalidProjectImage(imageUrl?: string | null): boolean {
  const value = (imageUrl ?? "").trim()
  if (!value) return true
  if (value === "NA") return true
  if (value.startsWith("data:")) return true
  if (value.includes("/placeholder.svg")) return true
  return false
}

export function getProjectImageSrc(
  imageUrl: string | null | undefined,
  input: CategoryInput | string,
  options: { width?: number; quality?: number } = { width: 1080, quality: 75 },
): string {
  if (isInvalidProjectImage(imageUrl)) {
    return getCategoryFallbackImage(input)
  }

  if (!imageUrl) {
    return getCategoryFallbackImage(input)
  }

  if (!isRemoteImageUrl(imageUrl)) return imageUrl

  return buildImageProxyUrl(imageUrl, options)
}
