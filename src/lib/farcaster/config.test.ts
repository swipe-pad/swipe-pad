import { afterEach, describe, expect, it } from "bun:test"

import {
  getAppUrl,
  getFarcasterManifestResponse,
  isFarcasterMiniAppFeatureEnabled,
} from "@/lib/farcaster/config"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("farcaster config", () => {
  it("uses NEXT_PUBLIC_APP_URL as canonical app URL", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://swipe-pad-plum.vercel.app/"

    expect(getAppUrl()).toBe("https://swipe-pad-plum.vercel.app")
  })

  it("enables mini app support by default", () => {
    delete process.env.NEXT_PUBLIC_FARCASTER_MINIAPP_ENABLED

    expect(isFarcasterMiniAppFeatureEnabled()).toBe(true)
  })

  it("builds a manifest without webhookUrl placeholders", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.swipepad.xyz"
    process.env.FARCASTER_ACCOUNT_ASSOCIATION_JSON = JSON.stringify({
      header: "header-value",
      payload: "payload-value",
      signature: "signature-value",
    })

    const manifest = getFarcasterManifestResponse()

    expect(manifest.accountAssociation).toEqual({
      header: "header-value",
      payload: "payload-value",
      signature: "signature-value",
    })
    expect(manifest.miniapp.homeUrl).toBe("https://app.swipepad.xyz")
    expect("webhookUrl" in manifest.miniapp).toBe(false)
    expect(manifest.frame).toEqual(manifest.miniapp)
  })
})
