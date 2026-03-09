export const CARD_DESIGN_IDS = [
  "SP_CARD_V2_STACK",
  "SP_CARD_V2_INLINE",
  "OZK_CARD_V1_NEON",
] as const

export type CardDesignId = (typeof CARD_DESIGN_IDS)[number]

export const CARD_DESIGN_META: Record<CardDesignId, { label: string; notes: string }> = {
  SP_CARD_V2_STACK: {
    label: "SwipePad Stack",
    notes: "Card sin acciones internas; usa controles externos.",
  },
  SP_CARD_V2_INLINE: {
    label: "SwipePad Inline",
    notes: "Card con acciones internas Skip/Undo/Like.",
  },
  OZK_CARD_V1_NEON: {
    label: "OZK Neon",
    notes: "Diseño experimental con boost flotante y borde neon.",
  },
}
