"use client"
import { Flame } from "lucide-react"
import { useProjects } from "@/lib/useConvexData"

interface TrendingSectionProps {
  onDonate: (project: any, amount?: number) => void
}

export function TrendingSection({ onDonate }: TrendingSectionProps) {
  const projects = useProjects()
  // Get top 5 projects by likes
  const trendingProjects = [...projects].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold">
          <Flame className="mr-2 size-5 text-[#FFD600]" /> Trending This Week
        </h2>
      </div>

      <div className="space-y-3">
        {trendingProjects.map((project) => (
          <div key={project.id} className="
            flex items-center rounded-lg bg-gray-900 p-3
          ">
            <img
              src={project.imageUrl || "/placeholder.svg"}
              alt={project.name}
              className="mr-3 size-12 rounded-md object-cover"
            />
            <div className="flex-1">
              <p className="font-medium">{project.name}</p>
              <div className="flex items-center text-xs text-gray-400">
                <span className="mr-2 rounded-full bg-gray-800 px-2 py-0.5">{project.category}</span>
                <span>{project.likes} likes</span>
              </div>
            </div>
            <button
              onClick={() => onDonate(project)}
              className="
                rounded-lg bg-[#677FEB] px-3 py-1 text-sm text-white
                hover:bg-[#5A6FD3]
              "
            >
              Donate
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
