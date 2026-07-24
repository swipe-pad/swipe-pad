import { describe, expect, test } from "bun:test"

import { buildBatchDonationParams } from "@/lib/beta-donation-batch"

const RECIPIENT_A = "0x1111111111111111111111111111111111111111"
const RECIPIENT_B = "0x2222222222222222222222222222222222222222"

describe("buildBatchDonationParams", () => {
  test("maps project + amount pairs to parallel recipients/amounts arrays", () => {
    const { recipients, amounts } = buildBatchDonationParams([
      { project: { name: "A", recipientWallet: RECIPIENT_A }, amount: 0.01 },
      { project: { name: "B", recipientWallet: RECIPIENT_B }, amount: 0.05 },
    ])

    expect(recipients).toEqual([RECIPIENT_A, RECIPIENT_B])
    expect(amounts).toEqual([10000000000000000n, 50000000000000000n])
  })

  test("converts dollar amounts to 18-decimal wei without floating point drift", () => {
    // 0.07 * 1e18 in plain JS floats is 70000000000000010, not 70000000000000000 —
    // this must go through the same string-based conversion as toUsdUnits().
    const { amounts } = buildBatchDonationParams([
      { project: { name: "Drift check", recipientWallet: RECIPIENT_A }, amount: 0.07 },
    ])

    expect(amounts).toEqual([70000000000000000n])
  })

  test("matches the contract's MIN_DONATION_AMOUNT ($0.01 -> 1e16 wei)", () => {
    const { amounts } = buildBatchDonationParams([
      { project: { name: "Min", recipientWallet: RECIPIENT_A }, amount: 0.01 },
    ])

    expect(amounts).toEqual([10n ** 16n])
  })

  test("throws when a project has no recipient wallet", () => {
    expect(() =>
      buildBatchDonationParams([
        { project: { name: "No wallet", recipientWallet: null }, amount: 0.01 },
      ]),
    ).toThrow('Project "No wallet" has no recipient wallet address')
  })

  test("returns empty arrays for an empty batch", () => {
    expect(buildBatchDonationParams([])).toEqual({ recipients: [], amounts: [] })
  })
})
