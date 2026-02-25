import { NextResponse } from "next/server"

import { getIpfsFallbackUrl, normalizeUrl } from "@/lib/image-delivery"

export const runtime = "edge"

const FETCH_TIMEOUT_MS = 5000
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const CACHE_CONTROL = "public, s-maxage=31536000, stale-while-revalidate=86400"

type ProxyError = {
  status: number
  error: string
  detail?: string
}

type ParsedTarget =
  | { ok: true; url: URL }
  | { ok: false; error: ProxyError }

type FetchOutcome =
  | { ok: true; response: Response; durationMs: number }
  | { ok: false; error: ProxyError }

type FetchWithSourceOutcome =
  | { ok: true; response: Response; durationMs: number; source: string }
  | { ok: false; error: ProxyError }

const BLOCKED_HOSTS = new Set([
  "localhost",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "100.100.100.200",
  "metadata",
  "metadata.google.internal",
])

function isPrivateIpv4(hostname: string): boolean {
  if (/^127\./.test(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^169\.254\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  return false
}

function isUnsafeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "")

  if (BLOCKED_HOSTS.has(host)) return true
  if (host.endsWith(".local") || host.endsWith(".internal")) return true
  if (isPrivateIpv4(host)) return true

  if (host.includes(":")) {
    if (host === "::1") return true
    if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return true
  }

  return false
}

function buildImageResponse(body: ArrayBuffer, upstream: Response, fetchMs: number, source: string) {
  const headers = new Headers()

  headers.set("Cache-Control", CACHE_CONTROL)
  headers.set("Content-Type", upstream.headers.get("content-type") || "image/*")

  const upstreamLength = upstream.headers.get("content-length")
  headers.set("Content-Length", upstreamLength || String(body.byteLength))

  const upstreamEtag = upstream.headers.get("etag")
  if (upstreamEtag) headers.set("ETag", upstreamEtag)

  if (process.env.NODE_ENV === "development") {
    console.info("[img-proxy] miss", {
      source,
      fetchMs,
      bytes: body.byteLength,
    })
    headers.set("X-Img-Proxy-Fetch-Ms", String(fetchMs))
    headers.set("X-Img-Proxy-Bytes", String(body.byteLength))
  }

  return new NextResponse(body, {
    status: 200,
    headers,
  })
}

function jsonError(error: ProxyError) {
  return NextResponse.json(
    {
      error: error.error,
      detail: error.detail,
    },
    { status: error.status }
  )
}

function parseUrl(raw: string): ParsedTarget {
  const normalized = normalizeUrl(raw)

  try {
    const parsed = new URL(normalized)

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        ok: false,
        error: {
          status: 400,
          error: "Invalid protocol",
          detail: "Only http/https/ipfs are supported",
        },
      }
    }

    if (parsed.username || parsed.password) {
      return {
        ok: false,
        error: {
          status: 400,
          error: "Credentials not allowed",
        },
      }
    }

    if (isUnsafeHost(parsed.hostname)) {
      return {
        ok: false,
        error: {
          status: 400,
          error: "Unsafe destination",
        },
      }
    }

    return { ok: true, url: parsed }
  } catch {
    return {
      ok: false,
      error: {
        status: 400,
        error: "Invalid URL",
      },
    }
  }
}

async function fetchImage(url: string): Promise<FetchOutcome> {
  const startedAt = Date.now()
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      return {
        ok: false,
        error: {
          status: response.status,
          error: "Upstream fetch failed",
          detail: `Origin responded with ${response.status}`,
        },
      }
    }

    return {
      ok: true,
      response,
      durationMs: Date.now() - startedAt,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error"
    const timeoutLike = /timeout|timed out|abort/i.test(message)

    return {
      ok: false,
      error: {
        status: timeoutLike ? 504 : 502,
        error: timeoutLike ? "Upstream timeout" : "Upstream network error",
      },
    }
  }
}

async function fetchWithIpfsFallback(raw: string): Promise<FetchWithSourceOutcome> {
  const primary = parseUrl(raw)
  if (!primary.ok) {
    return {
      ok: false,
      error: primary.error,
    }
  }

  const primaryResult = await fetchImage(primary.url.toString())
  if (primaryResult.ok) {
    return {
      ok: true,
      response: primaryResult.response,
      durationMs: primaryResult.durationMs,
      source: primary.url.toString(),
    }
  }

  const fallbackUrl = getIpfsFallbackUrl(raw)
  if (!fallbackUrl) {
    return {
      ok: false,
      error: primaryResult.error,
    }
  }

  const fallback = parseUrl(fallbackUrl)
  if (!fallback.ok) {
    return {
      ok: false,
      error: primaryResult.error,
    }
  }

  const fallbackResult = await fetchImage(fallback.url.toString())
  if (fallbackResult.ok) {
    return {
      ok: true,
      response: fallbackResult.response,
      durationMs: fallbackResult.durationMs,
      source: fallback.url.toString(),
    }
  }

  return {
    ok: false,
    error: fallbackResult.error,
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const edgeCacheStatus = request.headers.get("x-vercel-cache") || "unknown"
  const raw = requestUrl.searchParams.get("u")

  if (!raw) {
    return NextResponse.json({ error: "Missing u query param" }, { status: 400 })
  }

  if (raw.length > 4096) {
    return NextResponse.json({ error: "Image URL too long" }, { status: 400 })
  }

  const width = requestUrl.searchParams.get("w")
  if (width && !/^\d+$/.test(width)) {
    return NextResponse.json({ error: "Invalid width" }, { status: 400 })
  }

  const quality = requestUrl.searchParams.get("q")
  if (quality && !/^\d+$/.test(quality)) {
    return NextResponse.json({ error: "Invalid quality" }, { status: 400 })
  }

  const fetched = await fetchWithIpfsFallback(raw)
  if (!fetched.ok) {
    if (process.env.NODE_ENV === "development") {
      console.info("[img-proxy] error", {
        edgeCacheStatus,
        status: fetched.error.status,
        reason: fetched.error.error,
      })
    }
    return jsonError(fetched.error)
  }

  const { response, durationMs, source } = fetched

  const finalUrl = parseUrl(response.url)
  if (!finalUrl.ok) {
    return jsonError({
      status: 400,
      error: "Unsafe redirect destination",
    })
  }

  const contentLength = response.headers.get("content-length")
  if (contentLength) {
    const size = Number(contentLength)
    if (Number.isFinite(size) && size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image too large" }, { status: 413 })
    }
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase()
  if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
    return NextResponse.json({ error: "Unsupported content-type" }, { status: 415 })
  }

  const body = await response.arrayBuffer()
  if (body.byteLength > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 })
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[img-proxy] edge-cache", { edgeCacheStatus })
  }

  return buildImageResponse(body, response, durationMs, source)
}
