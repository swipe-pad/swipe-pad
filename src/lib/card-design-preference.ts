import type { CardDesignId } from "@/lib/card-designs"

export const CARD_DESIGN_STORAGE_KEY = "swipepad.activeCardDesign"

export function getStoredCardDesign(): CardDesignId | null {
  if (typeof window === "undefined") return null
  const value = window.localStorage.getItem(CARD_DESIGN_STORAGE_KEY)
  if (value === "SP_CARD_V2_STACK" || value === "SP_CARD_V2_INLINE" || value === "OZK_CARD_V1_NEON") {
    return value
  }
  return null
}

export function setStoredCardDesign(value: CardDesignId) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CARD_DESIGN_STORAGE_KEY, value)
}
