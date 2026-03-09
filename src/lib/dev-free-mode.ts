export const DEV_FREE_MODE_STORAGE_KEY = "swipepad.devFreeMode"

export function getDevFreeModeEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false
  if (typeof window === "undefined") return false

  const raw = window.localStorage.getItem(DEV_FREE_MODE_STORAGE_KEY)
  if (raw === null) return true
  return raw === "1"
}

export function setDevFreeModeEnabled(enabled: boolean) {
  if (process.env.NODE_ENV === "production") return
  if (typeof window === "undefined") return
  window.localStorage.setItem(DEV_FREE_MODE_STORAGE_KEY, enabled ? "1" : "0")
  window.dispatchEvent(new CustomEvent("swipepad:free-mode-change", { detail: { enabled } }))
}
