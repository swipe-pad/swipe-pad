export const DEV_GUEST_PROVISIONING_STORAGE_KEY = "swipepad.devGuestProvisioning"
const LEGACY_GUEST_WALLET_STORAGE_KEY = "swipepad:guest-wallet"

export function getDevGuestProvisioningEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return true
  if (typeof window === "undefined") return false

  const raw = window.localStorage.getItem(DEV_GUEST_PROVISIONING_STORAGE_KEY)
  if (raw === null) return false
  return raw === "1"
}

export function setDevGuestProvisioningEnabled(enabled: boolean) {
  if (process.env.NODE_ENV === "production") return
  if (typeof window === "undefined") return

  window.localStorage.setItem(DEV_GUEST_PROVISIONING_STORAGE_KEY, enabled ? "1" : "0")
  if (!enabled) {
    window.localStorage.removeItem(LEGACY_GUEST_WALLET_STORAGE_KEY)
  }
  window.dispatchEvent(new CustomEvent("swipepad:guest-provisioning-change", { detail: { enabled } }))
}
