export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false
  return !!(window.ethereum && (window.ethereum as any).isMiniPay)
}

export function isFarcaster(): boolean {
  if (typeof window === "undefined") return false
  return !!(window.ethereum && (window.ethereum as any).isFarcaster)
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
