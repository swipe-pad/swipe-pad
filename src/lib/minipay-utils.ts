import { getHostEnvironmentSync } from "@/lib/farcaster/context"

export function isMiniPay(): boolean {
  return getHostEnvironmentSync() === "minipay"
}

export function isFarcaster(): boolean {
  return getHostEnvironmentSync() === "farcaster-miniapp"
}

export function getMiniPayProvider() {
  if (typeof window === "undefined") return null
  return isMiniPay() ? window.ethereum : null
}

declare global {
  interface Window {
    ethereum?: any
  }
}
