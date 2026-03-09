import { ConvexHttpClient } from "convex/browser"

type SeedProject = {
  projectId: string
  title: string
  category: string
  source: string
  featured: boolean
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? ""

if (!convexUrl) {
  console.error("[seed:e2e:feed] NEXT_PUBLIC_CONVEX_URL is required")
  process.exit(1)
}

const adminKey = process.env.ADMIN_API_KEY ?? ""
const callerWallet =
  process.env.ADMIN_E2E_CALLER_WALLET ??
  process.env.ADMIN_WALLETS?.split(",").map((value) => value.trim()).filter(Boolean)[0]

const client = new ConvexHttpClient(convexUrl)

const seedProjects: SeedProject[] = [
  {
    projectId: "e2e-seed-eco-001",
    title: "E2E Eco Seed",
    category: "Eco Projects",
    source: "manual",
    featured: true,
  },
  {
    projectId: "e2e-seed-builders-001",
    title: "E2E Builders Seed",
    category: "Builders",
    source: "manual",
    featured: false,
  },
  {
    projectId: "e2e-seed-dapps-001",
    title: "E2E Dapps Seed",
    category: "Dapps",
    source: "manual",
    featured: false,
  },
]

async function seed() {
  for (const project of seedProjects) {
    await client.mutation("projects:upsertProject" as any, {
      adminKey,
      callerWallet,
      projectId: project.projectId,
      title: project.title,
      description: `Seed project for strict routing e2e: ${project.title}`,
      imageUrl: "/assets/builders-placeholder.png",
      category: project.category,
      recipientWallet: "0x1111111111111111111111111111111111111111",
      chain: "celo",
      source: project.source,
      verifiedLevel: 1,
      featured: project.featured,
    })

    await client.mutation("projects:setProjectActive" as any, {
      adminKey,
      callerWallet,
      projectId: project.projectId,
      active: true,
    })
  }

  console.log(`[seed:e2e:feed] seeded ${seedProjects.length} projects`)
}

seed().catch((error) => {
  console.error("[seed:e2e:feed] failed", error)
  process.exit(1)
})
