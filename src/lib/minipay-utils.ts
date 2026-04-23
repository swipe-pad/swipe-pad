import { getHostEnvironmentSync } from "@/lib/farcaster/context"

export function isMiniPay(): boolean {
  return getHostEnvironmentSync() === "minipay"
}

export function isFarcaster(): boolean {
  return getHostEnvironmentSync() === "farcaster-miniapp"
}

export function getMiniPayProvider(): unknown {
  if (typeof window === "undefined") return null
  return isMiniPay() ? (window as unknown as { ethereum?: unknown }).ethereum : null
}
