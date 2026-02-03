"use client"

import { ProjectCard } from "@/components/project-card"
import type { Project } from "@/lib/data"

interface CategorySectionProps {
  category: string
  projects: Project[]
  onDonate: (project: Project, amount?: number) => void
  onBoost?: (project: Project, amount: number) => void
}

export function CategorySection({ category, projects, onDonate, onBoost }: CategorySectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="mr-2">{category}</span>
        <span className="text-sm text-gray-400 font-normal">({projects.length})</span>
      </h2>

      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode="category"
              onDonate={(amount) => onDonate(project, amount)}
              onBoost={onBoost ? (amount) => onBoost(project, amount) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
