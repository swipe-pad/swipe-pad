import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HomeScreen } from "@/components/home-screen"
import { getProjectBySlug } from "@/lib/feed-server"

export const runtime = "edge"
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

  if (!project) {
    return {
      title: "SwipePad Project",
      description: "Discover projects on SwipePad",
      robots: {
        index: true,
        follow: true,
      },
    }
  }

  const description = project.description?.slice(0, 160) || `Support ${project.name} on SwipePad`

  return {
    title: `${project.name} | SwipePad`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${project.name} | SwipePad`,
      description,
      images: project.imageUrl ? [project.imageUrl] : undefined,
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
