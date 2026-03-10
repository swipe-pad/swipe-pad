import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HomeScreen } from "@/components/home-screen"
import { getAppUrl } from "@/lib/farcaster/config"
import { buildFarcasterMetadata } from "@/lib/farcaster/metadata"
import { getProjectBySlug } from "@/lib/feed-server"

export const runtime = "nodejs"
export const dynamic = "force-static"
export const revalidate = 60

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  const appUrl = getAppUrl()

  if (!project) {
    return {
      title: "SwipePad Project",
      description: "Discover projects on SwipePad",
      ...buildFarcasterMetadata({
        canonicalPath: `/p/${slug}`,
        title: "SwipePad Project",
        description: "Discover projects on SwipePad",
        imageUrl: `${appUrl}/opengraph-image.png`,
        buttonTitle: "Open SwipePad",
      }),
      robots: {
        index: true,
        follow: true,
      },
    }
  }

  const description = project.description?.slice(0, 160) || `Support ${project.name} on SwipePad`

  return {
    ...buildFarcasterMetadata({
      canonicalPath: `/p/${slug}`,
      title: `${project.name} | SwipePad`,
      description,
      imageUrl: project.imageUrl || `${appUrl}/opengraph-image.png`,
      buttonTitle: `Open ${project.name}`,
      splashImageUrl: `${appUrl}/farcaster/frame-splash.png`,
      splashBackgroundColor: "#070b14",
    }),
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function SharedProjectPage({ params }: PageProps) {
  const { slug } = await params
  const initialProject = await getProjectBySlug(slug)

  if (!initialProject) {
    notFound()
  }

  return <HomeScreen initialMode="shared-entry" initialProject={initialProject} />
}
