import { afterEach, describe, expect, it } from "bun:test"

import { addMiniApp } from "@/lib/farcaster/client"

const originalWindow = globalThis.window

afterEach(() => {
  if (originalWindow) {
    globalThis.window = originalWindow
    return
  }

  Reflect.deleteProperty(globalThis, "window")
})

describe("farcaster client", () => {
  it("delegates addMiniApp to the local test host", async () => {
    let called = false

    globalThis.window = {
      __SWIPEPAD_FARCASTER_TEST_HOST__: {
        enabled: true,
        addMiniApp: async () => {
          called = true
        },
      },
    } as typeof window

    await addMiniApp()

    expect(called).toBe(true)
    expect(window.__SWIPEPAD_LAST_ADD_MINIAPP__).toBe(true)
  })
})
