"use client"

import { cn } from "@/lib/utils"

interface ToggleMenuProps {
  viewMode: "swipe" | "list"
  setViewMode: (mode: "swipe" | "list") => void
}

export function ToggleMenu({ viewMode, setViewMode }: ToggleMenuProps) {
  return (
    <div className="flex justify-center w-full mb-4">
      <div className="flex p-1 bg-gray-700/30 rounded-full">
        <button
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            viewMode === "swipe" ? "bg-gray-800 text-white font-bold" : "bg-transparent text-gray-400",
          )}
          onClick={() => setViewMode("swipe")}
        >
          Swipe
        </button>
        <button
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            viewMode === "list" ? "bg-gray-800 text-white font-bold" : "bg-transparent text-gray-400",
          )}
          onClick={() => setViewMode("list")}
        >
          View All
        </button>
      </div>
    </div>
  )
}
