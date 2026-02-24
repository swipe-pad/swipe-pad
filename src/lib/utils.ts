import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getCategoryFallbackImage = (categoryName: string) => {
  const topLevelCategory = categoryName.toLowerCase().includes("builder") 
    ? "Builders" 
    : categoryName.toLowerCase().includes("eco") || categoryName.toLowerCase().includes("climate") || categoryName.toLowerCase().includes("nature") || categoryName.toLowerCase().includes("regeneration") || categoryName.toLowerCase().includes("social impact")
      ? "Eco Projects" 
      : "Projects"
      
  switch (topLevelCategory) {
    case "Builders":
      return "/assets/builders-placeholder.png"
    case "Eco Projects":
      return "/assets/eco-projects-placeholder.png"
    default:
      // Everything else uses the "dApps" generic placeholder
      return "/assets/dapps-placeholder.png"
  }
}
