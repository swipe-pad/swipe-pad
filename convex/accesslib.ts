export function normalizeWallet(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return normalized || null
}

export function getAllowlistSet(): Set<string> {
  const raw = process.env.GATED_ALLOWLIST ?? ""
  return new Set(
    raw
      .split(",")
      .map((entry) => normalizeWallet(entry))
      .filter((entry): entry is string => Boolean(entry))
  )
}

export function isAllowlistedWallet(wallet: string | null | undefined): boolean {
  const normalized = normalizeWallet(wallet)
  if (!normalized) return false
  return getAllowlistSet().has(normalized)
}

export async function sha256(input: string): Promise<string> {
  const payload = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest("SHA-256", payload)
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}

export function createInviteCodePlaintext(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const segments = [6, 4]
  return segments
    .map((length) => {
      let chunk = ""
      for (let index = 0; index < length; index += 1) {
        const random = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0
        chunk += alphabet[random % alphabet.length]
      }
      return chunk
    })
    .join("-")
}
