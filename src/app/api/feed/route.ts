import { NextRequest, NextResponse } from "next/server"

import { getFeedProject } from "@/lib/feed-server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const exclude = request.nextUrl.searchParams.get("exclude") ?? undefined
  const seed = request.nextUrl.searchParams.get("seed") ?? undefined

  const { project, nextCursor } = await getFeedProject({ exclude, seed })

  return NextResponse.json({
    project,
    nextCursor,
  })
}
