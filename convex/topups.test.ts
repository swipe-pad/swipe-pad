import { describe, expect, test } from "bun:test";

import {
  CUSD_CELO,
  ERC20_TRANSFER_TOPIC,
  MAX_VERIFY_ATTEMPTS,
  TOP_UP_PLANS,
  canonicalizeAddress,
  canonicalizeTxHash,
  evaluateReceipt,
  getRetryDelayMs,
  resolvePlanForPayment,
  shouldScheduleRetry,
  toHoldReason,
  usdToWei,
  walletOwnsPayment,
  type ReceiptLike,
} from "./topupsLib";

const RECEIVER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const PAYER = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const BUNDLER = "0xcccccccccccccccccccccccccccccccccccccccc";
const OTHER_TOKEN = "0xdddddddddddddddddddddddddddddddddddddddd";
const HASH = `0x${"ab".repeat(32)}`;

function addressTopic(address: string) {
  return `0x${"0".repeat(24)}${address.slice(2).toLowerCase()}`;
}

function transferLog(input: { token?: string; from: string; to: string; wei: bigint }) {
  return {
    address: input.token ?? CUSD_CELO,
    topics: [ERC20_TRANSFER_TOPIC, addressTopic(input.from), addressTopic(input.to)],
    data: `0x${input.wei.toString(16)}`,
  };
}

function receipt(overrides: Partial<ReceiptLike> = {}): ReceiptLike {
  return {
    status: "0x1",
    from: PAYER,
    logs: [transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("2.50") })],
    ...overrides,
  };
}

describe("canonicalizeTxHash", () => {
  test("lowercases and trims a valid hash", () => {
    expect(canonicalizeTxHash(`  0x${"AB".repeat(32)} `)).toBe(HASH);
  });

  test("rejects placeholders, short values and non-hex", () => {
    expect(canonicalizeTxHash("0x...")).toBeNull();
    expect(canonicalizeTxHash("0x1234")).toBeNull();
    expect(canonicalizeTxHash(`0x${"zz".repeat(32)}`)).toBeNull();
    expect(canonicalizeTxHash(HASH.slice(2))).toBeNull();
    expect(canonicalizeTxHash(undefined)).toBeNull();
    expect(canonicalizeTxHash(null)).toBeNull();
  });

  test("two casings of the same hash canonicalize identically (idempotency key)", () => {
    expect(canonicalizeTxHash(HASH.toUpperCase().replace("0X", "0x"))).toBe(canonicalizeTxHash(HASH));
  });
});

describe("canonicalizeAddress", () => {
  test("accepts a checksummed address and lowercases it", () => {
    expect(canonicalizeAddress("0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa")).toBe(RECEIVER);
  });

  test("rejects the .env.example placeholder, zero address and guest ids", () => {
    expect(canonicalizeAddress("0x...")).toBeNull();
    expect(canonicalizeAddress("0x0000000000000000000000000000000000000000")).toBeNull();
    expect(canonicalizeAddress("guest-1234")).toBeNull();
    expect(canonicalizeAddress("")).toBeNull();
    expect(canonicalizeAddress(undefined)).toBeNull();
  });
});

describe("usdToWei", () => {
  test("converts plan prices to 18-decimal cUSD without float drift", () => {
    expect(usdToWei("1.00")).toBe(10n ** 18n);
    expect(usdToWei("2.50")).toBe(25n * 10n ** 17n);
    expect(usdToWei("0.07")).toBe(7n * 10n ** 16n);
  });
});

describe("resolvePlanForPayment", () => {
  test("maps exact plan prices to their plan", () => {
    expect(resolvePlanForPayment(usdToWei("1.00"))?.id).toBe("starter");
    expect(resolvePlanForPayment(usdToWei("2.50"))?.id).toBe("session");
    expect(resolvePlanForPayment(usdToWei("5.00"))?.id).toBe("power");
  });

  test("uses the most expensive plan the payment covers", () => {
    expect(resolvePlanForPayment(usdToWei("3.00"))?.id).toBe("session");
    expect(resolvePlanForPayment(usdToWei("50.00"))?.id).toBe("power");
  });

  test("returns null when the payment covers no plan", () => {
    expect(resolvePlanForPayment(usdToWei("0.99"))).toBeNull();
    expect(resolvePlanForPayment(0n)).toBeNull();
  });
});

describe("evaluateReceipt", () => {
  test("credits the plan the money actually paid for and identifies the payer", () => {
    const result = evaluateReceipt(receipt(), RECEIVER);
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.plan.id).toBe("session");
    expect(result.plan.swipes).toBe(TOP_UP_PLANS.session!.swipes);
    expect(result.payer).toBe(PAYER);
    expect(result.txFrom).toBe(PAYER);
    expect(result.paidWei).toBe(usdToWei("2.50"));
  });

  test("keeps the transaction sender separate from the token sender (smart accounts)", () => {
    const result = evaluateReceipt(receipt({ from: BUNDLER }), RECEIVER);
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.payer).toBe(PAYER);
    expect(result.txFrom).toBe(BUNDLER);
  });

  test("ignores the client's plan: a $5 payment is a power plan even if the client said starter", () => {
    const result = evaluateReceipt(
      receipt({ logs: [transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("5.00") })] }),
      RECEIVER
    );
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.plan.id).toBe("power");
  });

  test("rejects reverted transactions", () => {
    expect(evaluateReceipt(receipt({ status: "0x0" }), RECEIVER)).toEqual({ kind: "reverted" });
  });

  test("a cUSD transfer to an unexpected address is held, not rejected (receiver config drift)", () => {
    // NEXT_PUBLIC_TOP_UP_RECEIVER_ADDRESS (what the widget paid) drifted from
    // TOP_UP_RECEIVER_ADDRESS (what Convex verifies against). The money is real.
    const result = evaluateReceipt(
      receipt({ logs: [transferLog({ from: PAYER, to: BUNDLER, wei: usdToWei("5.00") })] }),
      RECEIVER
    );
    expect(result).toEqual({
      kind: "unmatched_transfer",
      reason: "receiver_mismatch",
      payer: PAYER,
      txFrom: PAYER,
      to: BUNDLER,
      paidWei: usdToWei("5.00"),
    });
  });

  test("only a transaction with no cUSD transfer at all is a final no_matching_payment", () => {
    expect(evaluateReceipt(receipt({ logs: [] }), RECEIVER)).toEqual({ kind: "no_matching_payment" });

    const otherToken = evaluateReceipt(
      receipt({ logs: [transferLog({ token: OTHER_TOKEN, from: PAYER, to: RECEIVER, wei: usdToWei("5.00") })] }),
      RECEIVER
    );
    expect(otherToken).toEqual({ kind: "no_matching_payment" });
  });

  test("a payment to the receiver below the cheapest plan is held with the amount, not rejected", () => {
    const result = evaluateReceipt(
      receipt({ logs: [transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("0.50") })] }),
      RECEIVER
    );
    expect(result).toEqual({
      kind: "unmatched_transfer",
      reason: "amount_too_low",
      payer: PAYER,
      txFrom: PAYER,
      to: RECEIVER,
      paidWei: usdToWei("0.50"),
    });
  });

  test("a creditable transfer to the receiver wins over a larger transfer elsewhere", () => {
    const result = evaluateReceipt(
      receipt({
        logs: [
          transferLog({ from: PAYER, to: BUNDLER, wei: usdToWei("50.00") }),
          transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("1.00") }),
        ],
      }),
      RECEIVER
    );
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.plan.id).toBe("starter");
  });

  test("matches the receiver case-insensitively and picks the largest qualifying transfer", () => {
    const result = evaluateReceipt(
      receipt({
        logs: [
          transferLog({ from: BUNDLER, to: RECEIVER, wei: usdToWei("1.00") }),
          transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("2.50") }),
        ],
      }),
      RECEIVER.toUpperCase().replace("0X", "0x")
    );
    expect(result.kind).toBe("paid");
    if (result.kind !== "paid") return;
    expect(result.payer).toBe(PAYER);
    expect(result.plan.id).toBe("session");
  });

  test("skips malformed log data instead of throwing", () => {
    const result = evaluateReceipt(
      receipt({
        logs: [
          { address: CUSD_CELO, topics: [ERC20_TRANSFER_TOPIC, addressTopic(PAYER), addressTopic(RECEIVER)], data: "0xnope" },
          transferLog({ from: PAYER, to: RECEIVER, wei: usdToWei("1.00") }),
        ],
      }),
      RECEIVER
    );
    expect(result.kind).toBe("paid");
  });
});

describe("walletOwnsPayment (owner bind)", () => {
  test("the token sender owns the payment", () => {
    expect(walletOwnsPayment(PAYER, [PAYER, BUNDLER])).toBe(true);
  });

  test("the transaction sender owns the payment (EOA path)", () => {
    expect(walletOwnsPayment(BUNDLER, [PAYER, BUNDLER])).toBe(true);
  });

  test("is case-insensitive", () => {
    expect(walletOwnsPayment(PAYER.toUpperCase().replace("0X", "0x"), [PAYER])).toBe(true);
  });

  test("a different wallet cannot claim someone else's hash", () => {
    expect(walletOwnsPayment(OTHER_TOKEN, [PAYER, BUNDLER])).toBe(false);
  });

  test("guest pseudo-wallets and empty wallets never own on-chain payments", () => {
    expect(walletOwnsPayment("guest-abc", [PAYER])).toBe(false);
    expect(walletOwnsPayment(undefined, [PAYER])).toBe(false);
    expect(walletOwnsPayment(PAYER, [null, undefined])).toBe(false);
  });
});

describe("toHoldReason", () => {
  test("maps stored error codes back to a hold reason, defaulting to payer_mismatch", () => {
    expect(toHoldReason("receiver_mismatch")).toBe("receiver_mismatch");
    expect(toHoldReason("amount_too_low")).toBe("amount_too_low");
    expect(toHoldReason("payer_mismatch")).toBe("payer_mismatch");
    expect(toHoldReason(null)).toBe("payer_mismatch");
    expect(toHoldReason("receipt_not_found")).toBe("payer_mismatch");
  });
});

describe("retry schedule", () => {
  test("backs off and caps at the last step", () => {
    expect(getRetryDelayMs(1)).toBe(5_000);
    expect(getRetryDelayMs(2)).toBe(10_000);
    expect(getRetryDelayMs(3)).toBe(20_000);
    expect(getRetryDelayMs(50)).toBe(600_000);
    expect(getRetryDelayMs(0)).toBe(5_000);
  });

  test("stops scheduling after MAX_VERIFY_ATTEMPTS", () => {
    expect(shouldScheduleRetry(0)).toBe(true);
    expect(shouldScheduleRetry(MAX_VERIFY_ATTEMPTS - 1)).toBe(true);
    expect(shouldScheduleRetry(MAX_VERIFY_ATTEMPTS)).toBe(false);
  });
});
