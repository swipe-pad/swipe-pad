"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { useShallow } from "zustand/react/shallow"

import { AccessDeniedState } from "./AccessDeniedState"
import { InviteCodeDialog } from "./InviteCodeDialog"
import { WalletConnect } from "@/components/wallet-connect"
import { useApp } from "@/context/AppContext"
import { api } from "../../../../convex/_generated/api"
import { isFeatureEnabled } from "../../shared/feature-flags"

function accessReasonToMessage(reason: string | null) {
  switch (reason) {
    case "invite_code_invalid":
      return "That code does not exist or is inactive."
    case "invite_code_expired":
      return "That invite code has expired."
    case "invite_code_exhausted":
      return "That invite code has no uses remaining."
    case "invalid_invite_code":
      return "Enter a valid invite code."
    default:
      return null
  }
}

export function AccessGate() {
  const redeemInviteCode = useMutation(api.access.redeemInviteCode)
  const {
    walletConnected,
    walletAddress,
    accessState,
    accessReason,
    setBetaUserId,
    setBetaStatus,
    setAccessState,
    setAccessReason,
  } = useApp(useShallow((state) => ({
    walletConnected: state.walletConnected,
    walletAddress: state.walletAddress,
    accessState: state.accessState,
    accessReason: state.accessReason,
    setBetaUserId: state.setBetaUserId,
    setBetaStatus: state.setBetaStatus,
    setAccessState: state.setAccessState,
    setAccessReason: state.setAccessReason,
  })))

  const [inviteCode, setInviteCode] = useState("")
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If feature is disabled, don't render anything.
  // Keep this after hooks so disabled mode still follows React hook ordering.
  if (!isFeatureEnabled("gatedAccess")) {
    return null
  }

  const handleRedeemInviteCode = async () => {
    if (!walletAddress) {
      setInviteError("Connect a wallet first.")
      return
    }

    setIsSubmitting(true)
    setInviteError(null)
    try {
      const result = await redeemInviteCode({
        wallet: walletAddress,
        smartWalletAddress: walletAddress,
        code: inviteCode,
      })

      if (result.accessState === "allowed") {
        setAccessState("allowed")
        setAccessReason(null)
        setBetaUserId(result.userId)
        setBetaStatus(result.betaStatus)
        setInviteCode("")
        return
      }

      setInviteError(accessReasonToMessage(result.accessReason) ?? "Invite code rejected.")
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Invite code redemption failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If access is already allowed, don't render the gate
  if (accessState === "allowed" || accessState === null) {
    return null
  }

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden px-6 py-12 z-50">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_45%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.12),transparent_35%)]" />
      <div className="relative z-10 flex w-full flex-col items-center gap-5">
        {!walletConnected ? (
          <WalletConnect onConnect={() => undefined} />
        ) : accessState === "checking" ? (
          <div className="surface-panel-strong w-full max-w-md rounded-3xl border border-surface-border p-6 text-center text-sm text-muted-foreground">
            Checking launch access...
          </div>
        ) : accessState === "invite_required" ? (
          <InviteCodeDialog
            code={inviteCode}
            error={inviteError}
            isSubmitting={isSubmitting}
            onCodeChange={setInviteCode}
            onSubmit={() => void handleRedeemInviteCode()}
          />
        ) : (
          <AccessDeniedState
            reason={accessReason}
            canRetryCode
            onRetryCode={() => {
              setInviteError(accessReasonToMessage(accessReason))
              setAccessState("invite_required")
            }}
          />
        )}
      </div>
    </div>
  )
}
