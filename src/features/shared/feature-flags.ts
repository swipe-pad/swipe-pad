export type FeatureFlag = {
  enabled: boolean
  metadata?: Record<string, unknown>
}

export type FeatureFlags = {
  gatedAccess: FeatureFlag & {
    mode: "open" | "invite_only" | "closed"
    allowlist: string[]
  }
  promoFaucet: FeatureFlag & {
    dailySwipes: number
    maxTotalSwipes: number
    requiresOracle: boolean
    antiBotLevel: "low" | "medium" | "high"
  }
}

const DEFAULT_FLAGS: FeatureFlags = {
  gatedAccess: {
    enabled: false,
    mode: "open",
    allowlist: [],
  },
  promoFaucet: {
    enabled: false,
    dailySwipes: 5,
    maxTotalSwipes: 1000,
    requiresOracle: true,
    antiBotLevel: "medium",
  },
}

function parseEnvFlags(): Partial<FeatureFlags> {
  const flags: Partial<FeatureFlags> = {}

  // Gated Access
  if (process.env.GATED_ACCESS_ENABLED === "true") {
    flags.gatedAccess = {
      ...DEFAULT_FLAGS.gatedAccess,
      enabled: true,
      mode: (process.env.GATED_ACCESS_MODE as "open" | "invite_only" | "closed") || "invite_only",
      allowlist: process.env.GATED_ALLOWLIST?.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean) || [],
    }
  }

  // Promo Faucet
  if (process.env.PROMO_FAUCET_ENABLED === "true") {
    flags.promoFaucet = {
      ...DEFAULT_FLAGS.promoFaucet,
      enabled: true,
      dailySwipes: Number(process.env.PROMO_DAILY_SWIPES) || 5,
      maxTotalSwipes: Number(process.env.PROMO_MAX_TOTAL_SWIPES) || 1000,
      requiresOracle: process.env.PROMO_REQUIRES_ORACLE !== "false",
      antiBotLevel: (process.env.PROMO_ANTI_BOT_LEVEL as "low" | "medium" | "high") || "medium",
    }
  }

  return flags
}

let cachedFlags: FeatureFlags | null = null

export function getFeatureFlags(): FeatureFlags {
  if (cachedFlags) return cachedFlags
  
  const envFlags = parseEnvFlags()
  cachedFlags = {
    gatedAccess: { ...DEFAULT_FLAGS.gatedAccess, ...envFlags.gatedAccess },
    promoFaucet: { ...DEFAULT_FLAGS.promoFaucet, ...envFlags.promoFaucet },
  }
  
  return cachedFlags
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature].enabled
}

export function resetFeatureFlags(): void {
  cachedFlags = null
}
