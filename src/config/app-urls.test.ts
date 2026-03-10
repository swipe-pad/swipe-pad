import { afterEach, describe, expect, it } from "bun:test"

import {
  APP_ORIGINS,
  getAllowedDevOrigins,
  getCanonicalAppUrl,
  getConfiguredAppUrl,
  isAcceptedAppOrigin,
} from "@/config/app-urls"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("app URL config", () => {
  it("uses canonical app URL by default", () => {
    delete process.env.NEXT_PUBLIC_APP_URL

    expect(getConfiguredAppUrl()).toBe(APP_ORIGINS.canonical)
    expect(getCanonicalAppUrl()).toBe(APP_ORIGINS.canonical)
  })

  it("accepts the approved staging and development origins", () => {
    expect(isAcceptedAppOrigin(APP_ORIGINS.localhost)).toBe(true)
    expect(isAcceptedAppOrigin(APP_ORIGINS.lanDev)).toBe(true)
    expect(isAcceptedAppOrigin(APP_ORIGINS.staging)).toBe(true)
    expect(isAcceptedAppOrigin(APP_ORIGINS.canonical)).toBe(true)
    expect(isAcceptedAppOrigin("https://example.com")).toBe(false)
  })

  it("keeps allowed dev origins aligned with the central allowlist", () => {
    expect(getAllowedDevOrigins()).toEqual(["localhost", "swipe.lady"])
  })
})
