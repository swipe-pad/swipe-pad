"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Re-export the Project type from Convex for frontend compatibility
// This type mirrors the static data.ts Project interface but comes from Convex
export interface Project {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  recipientWallet: string;
  chain: string;
  source: string;
  verifiedLevel?: number;
  featured?: boolean;
  active?: boolean;
  website?: string;
  twitter?: string;
  github?: string;
  farcaster?: string;
  linkedin?: string;
  discord?: string;
  // Legacy compatibility fields (required for old components)
  id: string;
  name: string;
  walletAddress?: string;
  // UI interaction fields (optional, for local state)
  likes?: number;
  comments?: number;
  boostAmount?: number;
  userHasLiked?: boolean;
  userHasCommented?: boolean;
  isBookmarked?: boolean;
  reportCount?: number;
  fundingGoal?: number;
  fundingCurrent?: number;
}

// Adapter to transform Convex project to legacy Project interface
export function adaptConvexProject(p: any): Project {
  return {
    ...p,
    id: p.projectId, // Always set from projectId
    name: p.title,
    walletAddress: p.recipientWallet,
  };
}

/** Hook to get all projects from Convex */
export function useProjects() {
  const projects = useQuery(api.projects.getAllProjects);
  return projects?.map(adaptConvexProject) ?? [];
}

/** Hook to get categories from Convex */
export function useCategories() {
  const categories = useQuery(api.projects.getCategories);
  return categories ?? [];
}

/** Hook to get featured projects */
export function useFeaturedProjects() {
  const projects = useQuery(api.projects.getFeaturedProjects);
  return projects?.map(adaptConvexProject) ?? [];
}

/** Hook to get projects by source (karma, hypercerts, talent) */
export function useProjectsBySource(source: string) {
  const projects = useQuery(api.projects.getProjectsBySource, { source });
  return projects?.map(adaptConvexProject) ?? [];
}
