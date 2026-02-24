"use client"

import { cn } from "@/lib/utils"

interface ToggleMenuProps {
  viewMode: "swipe" | "list"
  setViewMode: (mode: "swipe" | "list") => void
}

export function ToggleMenu({ viewMode, setViewMode }: ToggleMenuProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="flex rounded-full border border-surface-border bg-[#15233d]/85 p-1 backdrop-blur-sm">
        <button
          className={cn(
            "rounded-full px-6 py-2 text-base font-semibold transition-colors",
            viewMode === "swipe"
              ? "bg-[#23314f] text-white"
              : "bg-transparent text-gray-400 hover:text-gray-200",
          )}
          onClick={() => setViewMode("swipe")}
        >
          Swipe
        </button>
        <button
          className={cn(
            "rounded-full px-6 py-2 text-base font-semibold transition-colors",
            viewMode === "list"
              ? "bg-[#23314f] text-white"
              : "bg-transparent text-gray-400 hover:text-gray-200",
          )}
          onClick={() => setViewMode("list")}
        >
          View All
        </button>
      </div>
    </div>
  )
}
