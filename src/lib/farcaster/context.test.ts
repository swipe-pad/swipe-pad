import { afterEach, describe, expect, it } from "bun:test"

import { getHostEnvironmentSync } from "@/lib/farcaster/context"

const originalWindow = globalThis.window

afterEach(() => {
  if (originalWindow) {
    globalThis.window = originalWindow
    return
  }

  Reflect.deleteProperty(globalThis, "window")
})

describe("host environment detection", () => {
  it("returns farcaster-miniapp when a Farcaster test host is present", () => {
    globalThis.window = {
      __SWIPEPAD_FARCASTER_TEST_HOST__: {
        enabled: true,
      },
    } as typeof window

    expect(getHostEnvironmentSync()).toBe("farcaster-miniapp")
  })

  it("returns minipay when the MiniPay provider flag is present", () => {
    globalThis.window = {
      ethereum: {
        isMiniPay: true,
      },
    } as unknown as typeof window

    expect(getHostEnvironmentSync()).toBe("minipay")
  })

  it("returns web when no host signal exists", () => {
    globalThis.window = {} as typeof window

    expect(getHostEnvironmentSync()).toBe("web")
  })
})
