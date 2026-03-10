import {
  getCanonicalAppDomain,
  getConfiguredAppUrl,
} from "@/config/app-urls"

export type FarcasterManifestAccountAssociation = {
  header: string
  payload: string
  signature: string
}

export type FarcasterManifestConfig = {
  version: "1"
  name: string
  homeUrl: string
  iconUrl: string
  imageUrl: string
  buttonTitle: string
  splashImageUrl?: string
  splashBackgroundColor?: string
  canonicalDomain?: string
}

const DEFAULT_SPLASH_COLOR = "#070b14"

export function getAppUrl(): string {
  return getConfiguredAppUrl()
}

export function getAppDomain(): string {
  return new URL(getAppUrl()).hostname
}

export function isFarcasterMiniAppFeatureEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_ENABLED?.trim().toLowerCase()
  if (!raw) return true
  return raw !== "0" && raw !== "false" && raw !== "off"
}

export function getFarcasterManifestConfig(): FarcasterManifestConfig {
  const appUrl = getAppUrl()

  return {
    version: "1",
    name: "SwipePad",
    homeUrl: appUrl,
    iconUrl: `${appUrl}/icons/favicon-256x256.png`,
    imageUrl: `${appUrl}/farcaster/frame-splash.png`,
    buttonTitle: "Launch SwipePad",
    splashImageUrl: `${appUrl}/farcaster/frame-splash.png`,
    splashBackgroundColor: DEFAULT_SPLASH_COLOR,
    canonicalDomain: getCanonicalAppDomain(),
  }
}

export function getFarcasterManifestAccountAssociation():
  | FarcasterManifestAccountAssociation
  | undefined {
  const raw = process.env.FARCASTER_ACCOUNT_ASSOCIATION_JSON?.trim()
  if (!raw) return undefined

  try {
    const parsed = JSON.parse(raw) as Partial<FarcasterManifestAccountAssociation>
    if (!parsed.header || !parsed.payload || !parsed.signature) {
      return undefined
    }

    return {
      header: parsed.header,
      payload: parsed.payload,
      signature: parsed.signature,
    }
  } catch {
    return undefined
  }
}

export function getFarcasterManifestResponse() {
  const config = getFarcasterManifestConfig()
  const accountAssociation = getFarcasterManifestAccountAssociation()

  return {
    ...(accountAssociation ? { accountAssociation } : {}),
    miniapp: config,
    frame: config,
  }
}
