"use client"

import { cn } from "@/lib/utils"

interface ToggleMenuProps {
  viewMode: "swipe" | "list"
  setViewMode: (mode: "swipe" | "list") => void
}

export function ToggleMenu({ viewMode, setViewMode }: ToggleMenuProps) {
  return (
    <div className="mb-4 flex w-full justify-center">
      <div className="flex rounded-full bg-gray-700/30 p-1">
        <button
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            viewMode === "swipe" ? "bg-gray-800 font-bold text-white" : `
              bg-transparent text-gray-400
            `,
          )}
          onClick={() => setViewMode("swipe")}
        >
          Swipe
        </button>
        <button
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            viewMode === "list" ? "bg-gray-800 font-bold text-white" : `
              bg-transparent text-gray-400
            `,
          )}
          onClick={() => setViewMode("list")}
        >
          View All
        </button>
      </div>
    </div>
  )
}
