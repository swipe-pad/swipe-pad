import { NextResponse } from "next/server"

import { getAppUrl } from "@/lib/farcaster/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    name: "SwipePad",
    description: "Swipe to support regenerative projects on Celo",
    icons: [
      {
        src: "/minipay/minipay-icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    banner: "/minipay/minipay-banner.png",
    chains: ["celo"],
    categories: ["finance", "social", "donation"],
    deeplink: getAppUrl(),
  })
}
