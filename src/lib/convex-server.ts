import "server-only"

import { ConvexHttpClient } from "convex/browser"

import { api } from "../../convex/_generated/api"

export type ServerProject = {
  _id: string
  projectId: string
  routeId: string
  title: string
  description: string
  category: string
  imageUrl: string
  recipientWallet: string
  chain: string
  source: string
  verifiedLevel?: number
  featured?: boolean
  active?: boolean
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
  id: string
  name: string
  walletAddress?: string
  likes?: number
  comments?: number
  boostAmount?: number
  userHasLiked?: boolean
  userHasCommented?: boolean
  isBookmarked?: boolean
  reportCount?: number
  fundingGoal?: number
  fundingCurrent?: number
}

type ConvexProject = {
  _id: string
  projectId: string
  routeId: string
  title: string
  description: string
  category: string
  imageUrl: string
  recipientWallet: string
  chain: string
  source: string
  verifiedLevel?: number
  featured?: boolean
  active?: boolean
  website?: string
  twitter?: string
  github?: string
  farcaster?: string
  linkedin?: string
  discord?: string
}

function toProject(project: ConvexProject): ServerProject {
  return {
    ...project,
    id: project.routeId,
    name: project.title,
    walletAddress: project.recipientWallet,
  }
}

async function fetchAllProjects(): Promise<ConvexProject[]> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return []

  const client = new ConvexHttpClient(convexUrl)
  const projects = await client.query(api.projects.getAllProjects, {})
  return (projects ?? []) as ConvexProject[]
}

export async function resolveProjectByRouteIdServer(routeId: string): Promise<ServerProject | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return null

  const client = new ConvexHttpClient(convexUrl)
  const project = await client.query(api.projects.getProjectByRouteId, { routeId })
  if (!project) return null

  return toProject(project as ConvexProject)
}

export async function getAllProjectsServer(): Promise<ServerProject[]> {
  const projects = await fetchAllProjects()
  return projects.map(toProject)
}

export async function getProjectByProjectIdServer(projectId: string): Promise<ServerProject | null> {
  const projects = await fetchAllProjects()
  const project = projects.find((candidate) => candidate.projectId === projectId)
  return project ? toProject(project) : null
}
