import { afterEach, describe, expect, it } from "bun:test"

import { getCanonicalShareUrl } from "@/lib/farcaster/share"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("farcaster share helpers", () => {
  it("builds canonical project URLs from env config", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://swipe-pad-plum.vercel.app"

    expect(getCanonicalShareUrl("solar-dao")).toBe("https://swipe-pad-plum.vercel.app/p/solar-dao")
  })
})
