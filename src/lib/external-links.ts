export function normalizeExternalUrl(rawUrl: string): string | null {
  const value = rawUrl.trim()
  if (!value || value.toUpperCase() === "NA") return null

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)
    ? value
    : `https://${value.replace(/^\/+/, "")}`

  try {
    const parsed = new URL(withProtocol)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return parsed.href
  } catch {
    return null
  }
}

export function getExternalHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return "external site"
  }
}

function isPrivateIp(hostname: string): boolean {
  if (/^127\./.test(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  return false
}

export function isUnsafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true
    if (host.endsWith(".local")) return true
    if (isPrivateIp(host)) return true

    return false
  } catch {
    return true
  }
}

export function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}
