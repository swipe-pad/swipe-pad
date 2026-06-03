"use client"

import { useMemo, useState } from "react"
import { Gift } from "lucide-react"
import { useProjects, type Project } from "@/lib/useConvexData"

interface WeeklyDropProps {
  onDonate: (project: Project, amount?: number) => void
}

export function WeeklyDrop({ onDonate }: WeeklyDropProps) {
  const projects = useProjects()
  const [randomSeed] = useState(() => Math.random())
  const weeklyProjects = useMemo(() => {
    return [...projects].sort(() => 0.5 - randomSeed).slice(0, 5)
  }, [projects, randomSeed])

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold">
          <Gift className="mr-2 size-5 text-[#FFD600]" /> Weekly Drop
        </h2>
      </div>

      <div className="rounded-lg bg-gray-900 p-4">
        <p className="mb-4 text-sm text-gray-300">
          Support 5 curated projects with a single donation. This week&apos;s theme:{" "}
          <span className="text-[#FFD600]">Positive Impact</span>
        </p>

        {isExpanded && (
          <div className="mb-4 space-y-3">
            {weeklyProjects.map((project) => (
              <div key={project.id} className="
                flex items-center rounded-lg bg-gray-800 p-2
              ">
                <img
                  src={project.imageUrl || "/placeholder.svg"}
                  alt={project.name}
                  className="mr-2 size-10 rounded-md object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{project.name}</p>
                  <span className="text-xs text-gray-400">{project.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              flex-1 rounded-lg bg-gray-800 py-2 text-sm font-medium text-white
              transition-colors
              hover:bg-gray-700
            "
          >
            {isExpanded ? "Hide Projects" : "View Projects"}
          </button>
          <button
            onClick={() => {
              weeklyProjects.forEach((project) => {
                onDonate(project, 1)
              })
            }}
            className="
              flex-1 rounded-lg bg-[#677FEB] py-2 text-sm font-medium text-white
              transition-colors
              hover:bg-[#5A6FD3]
            "
          >
            Support All (5 cUSD)
          </button>
        </div>
      </div>
    </div>
  )
}
