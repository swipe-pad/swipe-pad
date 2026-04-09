export function toUsdUnits(amountUsd: number) {
  const normalized = amountUsd.toFixed(2)
  const [wholePart, fractionPart = ""] = normalized.split(".")
  const paddedFraction = `${fractionPart}000000000000000000`.slice(0, 18)
  return BigInt(wholePart) * 10n ** 18n + BigInt(paddedFraction || "0")
}
