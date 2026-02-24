import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HomeScreen } from "../../page"
import { resolveProjectByRouteIdServer } from "@/lib/convex-server"

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params
  const project = await resolveProjectByRouteIdServer(projectId)

  if (!project) {
    return {
      title: "SwipePad Project",
      description: "Discover projects on SwipePad",
    }
  }

  return {
    title: `${project.name} | SwipePad`,
    description: project.description?.slice(0, 160) || `Support ${project.name} on SwipePad`,
    openGraph: {
      title: `${project.name} | SwipePad`,
      description: project.description?.slice(0, 160) || `Support ${project.name} on SwipePad`,
      images: project.imageUrl ? [project.imageUrl] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params
  const initialProject = await resolveProjectByRouteIdServer(projectId)

  if (!initialProject) {
    notFound()
  }

  return (
    <HomeScreen
      initialProjectId={projectId}
      initialProject={initialProject}
    />
  )
}
