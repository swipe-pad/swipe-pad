import { NextRequest, NextResponse } from "next/server"

import { getFeedProject } from "@/lib/feed-server"
import { TOP_LEVEL_CATEGORIES, type FeedCategory } from "@/lib/project-taxonomy"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const exclude = request.nextUrl.searchParams.get("exclude") ?? undefined
  const seed = request.nextUrl.searchParams.get("seed") ?? undefined
  const categoryParam = request.nextUrl.searchParams.get("category") ?? undefined
  const category = TOP_LEVEL_CATEGORIES.includes(categoryParam as FeedCategory) ? (categoryParam as FeedCategory) : undefined

  try {
    const { project, nextCursor } = await getFeedProject({ exclude, seed, category })

    return NextResponse.json({
      project,
      nextCursor,
    })
  } catch (error) {
    console.error("[api/feed] failed", error)
    return NextResponse.json({ project: null, nextCursor: "" }, { status: 200 })
  }
}
