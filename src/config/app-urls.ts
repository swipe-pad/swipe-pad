export const APP_ORIGINS = {
  localhost: "http://localhost",
  lanDev: "https://swipe.lady",
  staging: "https://swipe-pad-plum.vercel.app",
  canonical: "https://app.swipepad.xyz",
} as const

export const ACCEPTED_APP_ORIGINS = [
  APP_ORIGINS.localhost,
  APP_ORIGINS.lanDev,
  APP_ORIGINS.staging,
  APP_ORIGINS.canonical,
] as const

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "")
}

export function normalizeOrigin(value: string): string {
  return trimTrailingSlash(new URL(value).toString())
}

export function getAcceptedAppOrigins(): string[] {
  return [...ACCEPTED_APP_ORIGINS]
}

export function isAcceptedAppOrigin(value: string): boolean {
  try {
    const normalized = normalizeOrigin(value)
    return ACCEPTED_APP_ORIGINS.includes(normalized as (typeof ACCEPTED_APP_ORIGINS)[number])
  } catch {
    return false
  }
}

export function getCanonicalAppUrl(): string {
  return APP_ORIGINS.canonical
}

export function getConfiguredAppUrl(preferred = process.env.NEXT_PUBLIC_APP_URL): string {
  if (preferred && isAcceptedAppOrigin(preferred)) {
    return normalizeOrigin(preferred)
  }

  return getCanonicalAppUrl()
}

export function getCanonicalAppDomain(): string {
  return new URL(getCanonicalAppUrl()).hostname
}

export function getAllowedDevOrigins(): string[] {
  return ACCEPTED_APP_ORIGINS
    .map((origin) => new URL(origin).hostname)
    .filter((hostname) => hostname === "localhost" || hostname === "swipe.lady")
}
