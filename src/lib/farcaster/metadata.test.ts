import { describe, expect, it } from "bun:test"

import { buildFarcasterMetadata } from "@/lib/farcaster/metadata"

describe("farcaster metadata", () => {
  it("emits fc:miniapp and fc:frame tags", () => {
    const metadata = buildFarcasterMetadata({
      canonicalPath: "/p/solar-dao",
      title: "Solar DAO | SwipePad",
      description: "Support Solar DAO on SwipePad",
      imageUrl: "/opengraph-image.png",
      buttonTitle: "Open Solar DAO",
    })

    expect(metadata.alternates?.canonical).toBe("https://app.swipepad.xyz/p/solar-dao")
    expect(metadata.other?.["fc:miniapp"]).toBeString()
    expect(metadata.other?.["fc:frame"]).toBe(metadata.other?.["fc:miniapp"])
    expect(Array.isArray(metadata.openGraph?.images)).toBe(true)
    expect((metadata.openGraph?.images as Array<{ url: string }>)[0]).toEqual({
      url: "https://app.swipepad.xyz/opengraph-image.png",
    })
  })
})
