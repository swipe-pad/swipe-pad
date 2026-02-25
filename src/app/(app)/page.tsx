import { HomeScreen } from "@/components/home-screen"
import { getFeedProject } from "@/lib/feed-server"

export const runtime = "edge"
export const dynamic = "force-dynamic"

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function Page() {
  const seed = crypto.randomUUID()
  const { project } = await getFeedProject({ seed })
  return <HomeScreen initialMode="discover" initialProject={project} initialSessionSeed={seed} />
}
