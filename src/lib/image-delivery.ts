const IPFS_PRIMARY_GATEWAY = "https://cloudflare-ipfs.com/ipfs/"
const IPFS_FALLBACK_GATEWAY = "https://ipfs.io/ipfs/"

const IMAGE_PROXY_PATH = "/api/img"

type BuildImageProxyUrlOptions = {
  width?: number
  quality?: number
}

function sanitizePositiveInteger(value: number | undefined, min: number, max: number): number | undefined {
  if (!value || !Number.isFinite(value)) return undefined
  const integer = Math.floor(value)
  if (integer < min || integer > max) return undefined
  return integer
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return trimmed

  if (trimmed.startsWith("ipfs://")) {
    const path = trimmed.slice("ipfs://".length).replace(/^\/+/, "")
    return `${IPFS_PRIMARY_GATEWAY}${path}`
  }

  return trimmed
}

export function getIpfsFallbackUrl(input: string): string | null {
  const normalized = normalizeUrl(input)

  if (!normalized.startsWith(IPFS_PRIMARY_GATEWAY)) return null

  return `${IPFS_FALLBACK_GATEWAY}${normalized.slice(IPFS_PRIMARY_GATEWAY.length)}`
}

export function buildImageProxyUrl(sourceUrl: string, options: BuildImageProxyUrlOptions = {}): string {
  const width = sanitizePositiveInteger(options.width, 64, 4096)
  const quality = sanitizePositiveInteger(options.quality, 30, 95)

  const params = new URLSearchParams({ u: sourceUrl })
  if (width) params.set("w", String(width))
  if (quality) params.set("q", String(quality))

  return `${IMAGE_PROXY_PATH}?${params.toString()}`
}

export function isRemoteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || /^ipfs:\/\//i.test(value)
}

export function getAdaptivePreloadAhead(effectiveType?: string): number {
  const connectionType = effectiveType?.toLowerCase()
  if (connectionType === "4g") return 15
  if (connectionType === "3g") return 6
  if (connectionType === "2g" || connectionType === "slow-2g") return 2
  return 10
}
