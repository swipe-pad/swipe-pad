import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{
    projectId: string
  }>
}

export default async function LegacyProjectPage({ params }: PageProps) {
  const { projectId } = await params
  redirect(`/p/${encodeURIComponent(projectId)}`)
}
