"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/data"

interface CategoryMenuProps {
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  setCurrentProjectIndex: () => void
}

export function CategoryMenu({ selectedCategory, setSelectedCategory, setCurrentProjectIndex }: CategoryMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setCurrentProjectIndex()
  }

  if (categories.length === 0) {
    return null
  }

  const visibleCategories = categories

  return (
    <div className="relative w-full mb-3">
      <div
        ref={scrollRef}
        className="flex space-x-3 overflow-x-auto pb-2 px-6 scrollbar-hide"
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
              "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0 font-medium",
              selectedCategory === category ? "bg-[#FFD600] text-black" : "bg-gray-700 text-gray-300 hover:bg-gray-600",
            )}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="w-full h-1 bg-gray-800 rounded-full mx-6 mt-1">
        <div
          className="h-1 bg-[#FFD600] rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, (100 / visibleCategories.length) * 2)}%`,
            marginLeft: `${(selectedCategory ? categories.indexOf(selectedCategory) : 0) * (100 / visibleCategories.length)}%`,
          }}
        ></div>
      </div>
    </div>
  )
}
