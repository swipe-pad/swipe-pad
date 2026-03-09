"use client"

import { useEffect, useState } from "react"

import { DevBreadcrumbs } from "@/components/dev/DevBreadcrumbs"
import { Button } from "@/components/ui/button"
import { CARD_DESIGN_IDS, type CardDesignId } from "@/lib/card-designs"
import { getStoredCardDesign, setStoredCardDesign } from "@/lib/card-design-preference"
import { getDevFreeModeEnabled, setDevFreeModeEnabled } from "@/lib/dev-free-mode"
import { getDevGuestProvisioningEnabled, setDevGuestProvisioningEnabled } from "@/lib/dev-guest-provisioning"

export default function DevSettingsPage() {
  const isDev = process.env.NODE_ENV !== "production"
  const [freeModeEnabled, setFreeModeState] = useState(false)
  const [guestProvisioningEnabled, setGuestProvisioningEnabledState] = useState(false)
  const [activeDesign, setActiveDesign] = useState<CardDesignId>("SP_CARD_V2_STACK")

  useEffect(() => {
    setFreeModeState(getDevFreeModeEnabled())
    setGuestProvisioningEnabledState(getDevGuestProvisioningEnabled())
    const stored = getStoredCardDesign()
    if (stored) setActiveDesign(stored)
  }, [])

  if (!isDev) {
    return (
      <main className="mx-auto w-full max-w-xl p-6 text-white">
        <p className="text-sm text-muted-foreground">Dev settings are only available in development mode.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-xl space-y-5 p-6 text-white" data-testid="dev-settings-page">
      <DevBreadcrumbs current="Dev Settings" />
      <h1 className="font-display text-lg tracking-wide">Dev Settings</h1>

      <section className="surface-panel rounded-2xl border border-surface-border p-4">
        <h2 className="text-sm font-semibold">Free mode</h2>
        <p className="mt-1 text-xs text-muted-foreground">Disable crypto, credits and tracking to run swipes freely in dev.</p>
        <Button
          className="mt-3"
          variant={freeModeEnabled ? "default" : "secondary"}
          onClick={() => {
            const next = !freeModeEnabled
            setDevFreeModeEnabled(next)
            setFreeModeState(next)
          }}
        >
          {freeModeEnabled ? "Free mode ON" : "Free mode OFF"}
        </Button>
      </section>

      <section className="surface-panel rounded-2xl border border-surface-border p-4">
        <h2 className="text-sm font-semibold">Guest provisioning</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Auto-create guest wallet id and guest account in backend. Keep OFF to avoid polluting observability.
        </p>
        <Button
          className="mt-3"
          variant={guestProvisioningEnabled ? "default" : "secondary"}
          onClick={() => {
            const next = !guestProvisioningEnabled
            setDevGuestProvisioningEnabled(next)
            setGuestProvisioningEnabledState(next)
          }}
        >
          {guestProvisioningEnabled ? "Guest provisioning ON" : "Guest provisioning OFF"}
        </Button>
      </section>

      <section className="surface-panel rounded-2xl border border-surface-border p-4">
        <h2 className="text-sm font-semibold">Card design</h2>
        <p className="mt-1 text-xs text-muted-foreground">Select active card design for discover deck.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CARD_DESIGN_IDS.map((designId) => (
            <Button
              key={designId}
              size="sm"
              variant={activeDesign === designId ? "default" : "secondary"}
              onClick={() => {
                setStoredCardDesign(designId)
                setActiveDesign(designId)
              }}
            >
              {designId}
            </Button>
          ))}
        </div>
      </section>
    </main>
  )
}
