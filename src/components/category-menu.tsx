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

  const visibleCategories = categories

  return (
    <div className="relative mb-3 w-full">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex space-x-3 overflow-x-auto px-6 pb-2"
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
              selectedCategory === category ? "bg-[#FFD600] text-black" : `
                bg-gray-700 text-gray-300
                hover:bg-gray-600
              `,
            )}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="mx-6 mt-1 h-1 w-full rounded-full bg-gray-800">
        <div
          className="h-1 rounded-full bg-[#FFD600] transition-all duration-300"
          style={{
            width: `${Math.min(100, (100 / visibleCategories.length) * 2)}%`,
            marginLeft: `${(selectedCategory ? categories.indexOf(selectedCategory) : 0) * (100 / visibleCategories.length)}%`,
          }}
        ></div>
      </div>
    </div>
  )
}
