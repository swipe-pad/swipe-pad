"use client"

import { ShieldX } from "lucide-react"

import { Button } from "@/components/ui/button"

type AccessDeniedStateProps = {
  reason: string | null
  canRetryCode?: boolean
  onRetryCode?: () => void
}

export function AccessDeniedState({ reason, canRetryCode = false, onRetryCode }: AccessDeniedStateProps) {
  return (
    <div className="surface-panel-strong w-full max-w-md rounded-3xl border border-surface-border p-6 text-center shadow-2xl">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
        <ShieldX className="size-5" />
      </div>
      <h2 className="text-xl font-semibold text-white">Access not granted</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {reason === "wallet_required"
          ? "Connect a wallet or guest account to continue."
          : "This wallet is not on the launch allowlist and no valid invite code has been redeemed."}
      </p>
      {canRetryCode ? (
        <Button className="mt-5 w-full" variant="secondary" onClick={onRetryCode}>
          Try an invite code
        </Button>
      ) : null}
    </div>
  )
}
