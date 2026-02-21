export function requireAdmin(adminKey?: string, callerWallet?: string) {
  const requiredKey = process.env.ADMIN_API_KEY
  if (!requiredKey || adminKey !== requiredKey) {
    throw new Error("Unauthorized")
  }

  const adminWallets = (process.env.ADMIN_WALLETS ?? "")
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)

  if (adminWallets.length === 0) return
  if (!callerWallet) {
    throw new Error("Admin wallet required")
  }

  const normalized = callerWallet.trim().toLowerCase()
  if (!adminWallets.includes(normalized)) {
    throw new Error("Unauthorized")
  }
}
