export type DonationHistoryItem = {
  id: string
  createdAt: number
  projectId: string
  projectName: string
  recipientWallet: string
  amount: number
  currency: string
  txHash: string | null
  settlement: "promo" | "paid"
  kind: "swipe" | "donation" | "boost"
}

export function buildDonationHistoryItem(input: {
  projectId: string
  projectName: string
  recipientWallet: string
  amount: number
  currency: string
  txHash: string | null
  settlement: "promo" | "paid"
  kind: "swipe" | "donation" | "boost"
}): DonationHistoryItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    ...input,
  }
}

export function getDonationExplorerLinks(txHash: string | null) {
  if (!txHash) {
    return {
      celoscan: null,
      blockscout: null,
    }
  }

  return {
    celoscan: `https://celoscan.io/tx/${txHash}`,
    blockscout: `https://celo.blockscout.com/tx/${txHash}`,
  }
}

export function shortenHash(value: string, head = 8, tail = 6) {
  if (value.length <= head + tail) return value
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}
