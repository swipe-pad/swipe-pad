import { afterEach, describe, expect, it } from "bun:test"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("GET /farcaster.json", () => {
  it("serves the dynamic Farcaster manifest", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://swipe-pad-plum.vercel.app"

    const { GET } = await import("./route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.miniapp.homeUrl).toBe("https://swipe-pad-plum.vercel.app")
    expect(body.frame.homeUrl).toBe("https://swipe-pad-plum.vercel.app")
    expect(body.miniapp.webhookUrl).toBeUndefined()
  })
})
