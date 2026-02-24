"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { useCategories } from "@/lib/useConvexData"

interface CategoryMenuProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  setCurrentProjectIndex: () => void
}

export function CategoryMenu({ selectedCategory, setSelectedCategory, setCurrentProjectIndex }: CategoryMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const categories = useCategories()

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setCurrentProjectIndex()
  }

  if (categories.length === 0) {
    return null
  }

  const visibleCategories = ["All", ...categories]

  return (
    <div className="relative mb-2 w-full">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto px-1 pb-2"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {visibleCategories.map((category) => (
          <button
            key={category}
            className={cn(
              `
                shrink-0 rounded-full px-4 py-2 text-sm font-medium
                whitespace-nowrap transition-colors
              `,
              selectedCategory === category
                ? "bg-[#F9DE4B] text-black shadow-lg shadow-yellow-900/20"
                : "bg-[#2a334a] text-gray-300 hover:bg-[#34405a]",
            )}
            onClick={() => handleCategoryClick(category)}
          >
            {category === "All" ? "See All" : category}
          </button>
        ))}
      </div>

      <div className="mt-1 h-1 w-full rounded-full bg-[#1f2a44]">
        <div
          className="h-1 rounded-full bg-[#F9DE4B] transition-all duration-300"
          style={{
            width: `${Math.min(100, (100 / visibleCategories.length) * 2)}%`,
            marginLeft: `${(selectedCategory ? visibleCategories.indexOf(selectedCategory) : 0) * (100 / visibleCategories.length)}%`,
          }}
        ></div>
      </div>
    </div>
  )
}
