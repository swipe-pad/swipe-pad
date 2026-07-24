import { toUsdUnits } from "@/lib/funds-flow"

export interface BatchDonationItem {
  project: { name: string; recipientWallet?: string | null }
  amount: number // USD, e.g. 0.01
}

export interface BatchDonationParams {
  recipients: `0x${string}`[]
  amounts: bigint[]
}

/**
 * Builds the (recipients, amounts) arrays required by
 * `BetaDonationPool.batchDonate` from cart/donation items.
 *
 * Amounts are dollar-denominated in the UI; the pool token (cUSD/USDC) uses
 * 18 decimals. Uses the same string-based conversion as `toUsdUnits` (rather
 * than `amount * 1e18`) to avoid floating point drift — e.g. in plain JS
 * floats, `0.07 * 1e18 === 70000000000000010`, not `70000000000000000`.
 *
 * Throws if any item is missing a recipient wallet address, so a bad project
 * fails loudly before a transaction is sent rather than silently dropping a
 * recipient from the batch.
 */
export function buildBatchDonationParams(items: BatchDonationItem[]): BatchDonationParams {
  const recipients: `0x${string}`[] = []
  const amounts: bigint[] = []

  for (const item of items) {
    const wallet = item.project.recipientWallet
    if (!wallet) {
      throw new Error(`Project "${item.project.name}" has no recipient wallet address`)
    }
    recipients.push(wallet as `0x${string}`)
    amounts.push(toUsdUnits(item.amount))
  }

  return { recipients, amounts }
}
