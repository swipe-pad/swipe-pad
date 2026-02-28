import { NextRequest, NextResponse } from "next/server"

import { getFeedProject } from "@/lib/feed-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const exclude = request.nextUrl.searchParams.get("exclude") ?? undefined
  const seed = request.nextUrl.searchParams.get("seed") ?? undefined

  try {
    const { project, nextCursor } = await getFeedProject({ exclude, seed })

    return NextResponse.json({
      project,
      nextCursor,
    })
  } catch (error) {
    console.error("[api/feed] failed", error)
    return NextResponse.json({ project: null, nextCursor: "" }, { status: 200 })
  }
}
