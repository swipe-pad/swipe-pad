export type TopUpPlan = {
  id: string
  label: string
  swipes: number
  amountUsd: string
  currency: "cUSD"
  popular?: boolean
}

export const TOP_UP_PLANS: TopUpPlan[] = [
  { id: "starter", label: "Keep swiping", swipes: 20, amountUsd: "1.00", currency: "cUSD" },
  { id: "session", label: "Discovery session", swipes: 50, amountUsd: "2.50", currency: "cUSD", popular: true },
  { id: "power", label: "Power session", swipes: 120, amountUsd: "5.00", currency: "cUSD" },
]

export function getTopUpPlan(planId: string | undefined) {
  return TOP_UP_PLANS.find((plan) => plan.id === planId) ?? TOP_UP_PLANS[1] ?? TOP_UP_PLANS[0]
}
