import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export { getCategoryFallbackImage } from "@/lib/project-taxonomy"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
