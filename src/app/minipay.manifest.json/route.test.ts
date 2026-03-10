import { afterEach, describe, expect, it } from "bun:test"

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe("GET /minipay.manifest.json", () => {
  it("serves a dynamic MiniPay manifest from the central app URL config", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://swipe.lady"

    const { GET } = await import("./route")
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.deeplink).toBe("https://swipe.lady")
    expect(body.name).toBe("SwipePad")
  })
})
