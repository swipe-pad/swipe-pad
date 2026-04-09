"use client"

import { Loader2, Ticket } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type InviteCodeDialogProps = {
  code: string
  error: string | null
  isSubmitting: boolean
  onCodeChange: (value: string) => void
  onSubmit: () => void
}

export function InviteCodeDialog({
  code,
  error,
  isSubmitting,
  onCodeChange,
  onSubmit,
}: InviteCodeDialogProps) {
  return (
    <div className="surface-panel-strong w-full max-w-md rounded-3xl border border-surface-border p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-[#243559] text-[#f7d54a]">
          <Ticket className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Enter your invite code</h2>
          <p className="text-sm text-muted-foreground">This launch is gated. Allowlisted wallets enter automatically.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Input
          value={code}
          onChange={(event) => onCodeChange(event.target.value.toUpperCase())}
          placeholder="SWIPEPAD-XXXX"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onSubmit()
            }
          }}
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <Button className="w-full" onClick={onSubmit} disabled={isSubmitting || code.trim().length < 4}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Redeem code"}
        </Button>
      </div>
    </div>
  )
}
