"use client"

import { useMemo, useState } from "react"
import { Check, Sparkles, Wallet, X } from "lucide-react"
import { BuyWidget, useActiveAccount } from "thirdweb/react"
import { inAppWallet, createWallet } from "thirdweb/wallets"
import { celo } from "thirdweb/chains"
import { useAccount as useWagmiAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import { client } from "@/lib/thirdweb-client"
import { getHostEnvironmentSync } from "@/lib/farcaster/context"
import { TOP_UP_PLANS, getTopUpPlan, type TopUpPlan } from "@/lib/top-up-plans"
import { TOKEN_ADDRESSES } from "@/types/contracts"

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "email", "guest"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
]

type TopUpSuccess = {
  planId: string
  swipesGranted: number
  txHash?: string
}

type TopUpDialogProps = {
  isOpen: boolean
  reason?: string
  defaultPlanId?: string
  walletAddress: string | null
  creditsRemaining: number
  creditsMax: number
  onClose: () => void
  onSuccess: (result: TopUpSuccess) => void
}

function getReceiverAddress(): `0x${string}` | null {
  const receiver = process.env.NEXT_PUBLIC_TOP_UP_RECEIVER_ADDRESS
  return receiver?.startsWith("0x") ? (receiver as `0x${string}`) : null
}

function getHostLabel() {
  const host = getHostEnvironmentSync()

  if (host === "minipay") {
    return {
      title: "Recharge with MiniPay",
      description: "Use your MiniPay wallet to keep swiping without leaving the flow.",
    }
  }

  if (host === "farcaster-miniapp") {
    return {
      title: "Recharge with Farcaster wallet",
      description: "Continue with your Farcaster wallet, then jump back into discovery.",
    }
  }

  return {
    title: "Recharge swipes",
    description: "Use crypto, card, or onramp options through Thirdweb to keep discovering projects.",
  }
}

export function TopUpDialog({
  isOpen,
  reason,
  defaultPlanId,
  walletAddress,
  creditsRemaining,
  creditsMax,
  onClose,
  onSuccess,
}: TopUpDialogProps) {
  const thirdwebAccount = useActiveAccount()
  const { address: wagmiAddress } = useWagmiAccount()
  const receiverAddress = getReceiverAddress()
  const [selectedPlan, setSelectedPlan] = useState<TopUpPlan>(() => getTopUpPlan(defaultPlanId))
  const hostCopy = useMemo(() => getHostLabel(), [])

  if (!isOpen) return null

  const activeAddress = thirdwebAccount?.address ?? wagmiAddress ?? walletAddress
  const isZeroSwipes = reason === "zero-swipes"

  return (
    <div className="fixed inset-0 z-120 flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="surface-panel-strong max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-surface-border shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-surface-border bg-surface-2/95 px-5 py-4 backdrop-blur-xl">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              {isZeroSwipes ? "Out of swipes" : "Top up"}
            </div>
            <h2 className="text-xl font-semibold text-white">{hostCopy.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{hostCopy.description}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-white"
            aria-label="Close top-up"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="rounded-2xl border border-surface-border bg-black/20 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current swipes</span>
              <span className="font-semibold text-white">{creditsRemaining} / {creditsMax}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="size-3.5" />
              <span className="truncate">{activeAddress ?? "Connect a wallet in the payment step"}</span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {TOP_UP_PLANS.map((plan) => {
              const selected = selectedPlan.id === plan.id

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-2xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/15 text-white"
                      : "border-surface-border bg-black/20 text-muted-foreground hover:border-primary/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{plan.label}</span>
                    {selected ? <Check className="size-4 text-primary" /> : null}
                  </div>
                  <div className="mt-2 text-lg font-bold text-white">{plan.swipes}</div>
                  <div className="text-xs">swipes for ${plan.amountUsd}</div>
                  {plan.popular ? <div className="mt-2 text-[11px] font-semibold text-primary">Popular</div> : null}
                </button>
              )
            })}
          </div>

          {receiverAddress ? (
            <div className="overflow-hidden rounded-2xl border border-surface-border bg-black/20">
              <BuyWidget
                client={client}
                chain={celo}
                tokenAddress={TOKEN_ADDRESSES.celo.cUSD}
                receiverAddress={receiverAddress}
                amount={selectedPlan.amountUsd}
                currency="USD"
                title={`Recharge ${selectedPlan.swipes} swipes`}
                description="Funds are received by SwipePad and credits are granted after payment verification."
                buttonLabel="Recharge swipes"
                paymentMethods={["crypto", "card"]}
                amountEditable={false}
                tokenEditable={false}
                showThirdwebBranding={false}
                theme="dark"
                connectOptions={{ wallets, accountAbstraction: { chain: celo, sponsorGas: true } }}
                purchaseData={{
                  kind: "swipe-top-up",
                  planId: selectedPlan.id,
                  swipes: selectedPlan.swipes,
                  walletAddress: activeAddress ?? null,
                }}
                onSuccess={() => {
                  onSuccess({ planId: selectedPlan.id, swipesGranted: selectedPlan.swipes })
                  onClose()
                }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Configure <code>NEXT_PUBLIC_TOP_UP_RECEIVER_ADDRESS</code> to enable live top-ups.
            </div>
          )}

          <Button variant="ghost" className="w-full" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  )
}
