import { NextResponse } from "next/server"

import { getFarcasterManifestResponse } from "@/lib/farcaster/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(getFarcasterManifestResponse(), {
    headers: {
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  })
}
