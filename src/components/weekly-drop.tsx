"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import { projects } from "@/lib/data"

interface WeeklyDropProps {
  onDonate: (project: any, amount?: number) => void
}

export function WeeklyDrop({ onDonate }: WeeklyDropProps) {
  // Get 5 random projects for the weekly drop
  const weeklyProjects = [...projects].sort(() => 0.5 - Math.random()).slice(0, 5)

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Gift className="w-5 h-5 text-[#FFD600] mr-2" /> Weekly Drop
        </h2>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg">
        <p className="text-sm text-gray-300 mb-4">
          Support 5 curated projects with a single donation. This week's theme:{" "}
          <span className="text-[#FFD600]">Positive Impact</span>
        </p>

        {isExpanded && (
          <div className="space-y-3 mb-4">
            {weeklyProjects.map((project) => (
              <div key={project.id} className="bg-gray-800 p-2 rounded-lg flex items-center">
                <img
                  src={project.imageUrl || "/placeholder.svg"}
                  alt={project.name}
                  className="w-10 h-10 object-cover rounded-md mr-2"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{project.name}</p>
                  <span className="text-xs text-gray-400">{project.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {isExpanded ? "Hide Projects" : "View Projects"}
          </button>
          <button
            onClick={() => {
              weeklyProjects.forEach((project) => {
                onDonate(project, 1)
              })
            }}
            className="flex-1 py-2 bg-[#677FEB] hover:bg-[#5A6FD3] text-white font-medium rounded-lg transition-colors text-sm"
          >
            Support All (5 cUSD)
          </button>
        </div>
      </div>
    </div>
  )
}
