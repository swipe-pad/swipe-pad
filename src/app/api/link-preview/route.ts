import { NextResponse } from "next/server"

type LinkPreviewPayload = {
  url: string
  title: string
  description: string
  image: string | null
  fallbackImage: string | null
}

type CacheEntry = {
  expiresAt: number
  payload: LinkPreviewPayload
}

const LINK_PREVIEW_TTL_MS = 6 * 60 * 60 * 1000
const linkPreviewCache = new Map<string, CacheEntry>()

function withCacheHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400")
  return response
}

function getCachedPreview(key: string): LinkPreviewPayload | null {
  const now = Date.now()
  const cached = linkPreviewCache.get(key)
  if (!cached) return null
  if (cached.expiresAt <= now) {
    linkPreviewCache.delete(key)
    return null
  }
  return cached.payload
}

function setCachedPreview(key: string, payload: LinkPreviewPayload) {
  linkPreviewCache.set(key, {
    expiresAt: Date.now() + LINK_PREVIEW_TTL_MS,
    payload,
  })
}

function isPrivateIp(hostname: string): boolean {
  if (/^127\./.test(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  return false
}

function isUnsafeHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true
  if (host.endsWith(".local")) return true
  if (isPrivateIp(host)) return true
  return false
}

function isTwitterHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === "x.com" || host === "www.x.com" || host === "twitter.com" || host === "www.twitter.com"
}

function isTweetUrl(url: URL): boolean {
  return /\/status\/\d+/i.test(url.pathname)
}

function getMetaAttribute(tag: string, attribute: string): string | null {
  const regex = new RegExp(`${attribute}=["']([^"']+)["']`, "i")
  const match = tag.match(regex)
  return match?.[1] ?? null
}

function pickMeta(html: string, keys: string[]): string | null {
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? []

  for (const tag of tags) {
    const property = getMetaAttribute(tag, "property")?.toLowerCase()
    const name = getMetaAttribute(tag, "name")?.toLowerCase()
    const content = getMetaAttribute(tag, "content")

    if (!content) continue

    for (const key of keys) {
      const target = key.toLowerCase()
      if (property === target || name === target) {
        return content
      }
    }
  }

  return null
}

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function buildFaviconUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}/favicon.ico`
  } catch {
    return null
  }
}

async function fetchTwitterOembed(url: string) {
  const endpoint = `https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=${encodeURIComponent(url)}`
  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(4500),
  })

  if (!response.ok) return null

  const payload = (await response.json()) as {
    author_name?: string
    html?: string
    thumbnail_url?: string
  }

  const text = payload.html ? stripHtml(payload.html) : ""
  const author = payload.author_name ? `@${payload.author_name}` : "X"

  return {
    title: `Post from ${author}`,
    description: (text || "External post on X").slice(0, 240),
    image: payload.thumbnail_url ?? null,
  }
}

function extractTitle(html: string): string | null {
  const ogTitle = pickMeta(html, ["og:title", "twitter:title"])
  if (ogTitle) return ogTitle

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return titleMatch?.[1]?.trim() ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get("url")

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 })
  }

  const cacheKey = target.toString()
  const cachedPayload = getCachedPreview(cacheKey)
  if (cachedPayload) {
    return withCacheHeaders(NextResponse.json(cachedPayload))
  }

  if (isUnsafeHost(target.hostname)) {
    return NextResponse.json({ error: "Unsafe destination" }, { status: 400 })
  }

  if (isTwitterHost(target.hostname) && isTweetUrl(target)) {
    try {
      const oembed = await fetchTwitterOembed(target.toString())
      if (oembed) {
        const payload: LinkPreviewPayload = {
          url: target.toString(),
          title: oembed.title,
          description: oembed.description,
          image: oembed.image,
          fallbackImage: buildFaviconUrl(target.toString()),
        }
        setCachedPreview(cacheKey, payload)
        return withCacheHeaders(NextResponse.json(payload))
      }
    } catch {
      // Fallback to generic HTML scraping below
    }
  }

  try {
    const response = await fetch(target.toString(), {
      headers: {
        "user-agent": "SwipePad Link Preview Bot/1.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    })

    const finalUrl = response.url
    const finalHost = new URL(finalUrl).hostname
    if (isUnsafeHost(finalHost)) {
      return NextResponse.json({ error: "Unsafe destination" }, { status: 400 })
    }

    const contentType = response.headers.get("content-type") || ""
    if (!contentType.includes("text/html")) {
      const payload: LinkPreviewPayload = {
        url: finalUrl,
        title: finalHost,
        description: "External website",
        image: null,
        fallbackImage: buildFaviconUrl(finalUrl),
      }
      setCachedPreview(cacheKey, payload)
      return withCacheHeaders(NextResponse.json(payload))
    }

    const html = await response.text()
    const title = extractTitle(html) || finalHost
    const description = pickMeta(html, ["og:description", "twitter:description", "description"]) || "External website"
    const image = pickMeta(html, ["og:image", "twitter:image"])

    const payload: LinkPreviewPayload = {
      url: finalUrl,
      title: title.trim().slice(0, 140),
      description: description.trim().slice(0, 240),
      image,
      fallbackImage: buildFaviconUrl(finalUrl),
    }
    setCachedPreview(cacheKey, payload)
    return withCacheHeaders(NextResponse.json(payload))
  } catch {
    const payload: LinkPreviewPayload = {
      url: target.toString(),
      title: target.hostname,
      description: "Could not load preview metadata",
      image: null,
      fallbackImage: buildFaviconUrl(target.toString()),
    }
    setCachedPreview(cacheKey, payload)
    return withCacheHeaders(NextResponse.json(payload))
  }
}
