"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, PlusSquare } from "lucide-react"

import { addMiniApp, getMiniAppContext, isInFarcasterMiniApp } from "@/lib/farcaster/client"
import type { FarcasterMiniAppContext } from "@/lib/farcaster/context"

export function FarcasterMiniAppPrompt() {
  const [context, setContext] = useState<FarcasterMiniAppContext | null>(null)
  const [isFarcasterHost, setIsFarcasterHost] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    isInFarcasterMiniApp()
      .then((result) => {
        if (!active || !result) return
        setIsFarcasterHost(true)
        return getMiniAppContext()
      })
      .then((nextContext) => {
        if (!active || !nextContext) return
        setContext(nextContext)
      })
      .catch((error) => {
        console.error("[farcaster] prompt context failed", error)
      })

    return () => {
      active = false
    }
  }, [])

  if (!isFarcasterHost) return null

  const isAdded = Boolean(context?.client.added)

  const handleAddMiniApp = async () => {
    setIsAdding(true)
    setStatus(null)

    try {
      await addMiniApp()
      setContext((current) =>
        current
          ? {
              ...current,
              client: {
                ...current.client,
                added: true,
              },
            }
          : current,
      )
      setStatus("Saved in Farcaster")
    } catch (error) {
      console.error("[farcaster] add mini app failed", error)
      setStatus("Could not save Mini App")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="mt-2 flex items-center justify-end gap-2">
      {isAdded ? (
        <div
          className="
            inline-flex items-center gap-1 rounded-full border border-emerald-400/25
            bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200
          "
          data-testid="farcaster-miniapp-saved"
        >
          <CheckCircle2 className="size-3.5" />
          Saved in Farcaster
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void handleAddMiniApp()}
          disabled={isAdding}
          className="
            inline-flex items-center gap-1 rounded-full border border-[#8A63FF]/45
            bg-[#8A63FF]/15 px-3 py-1 text-[11px] font-semibold text-[#d9ccff]
            transition-colors hover:bg-[#8A63FF]/25 disabled:opacity-60
          "
          data-testid="farcaster-add-miniapp"
        >
          <PlusSquare className="size-3.5" />
          {isAdding ? "Saving..." : "Save Mini App"}
        </button>
      )}

      {status ? <span className="text-[11px] text-gray-300">{status}</span> : null}
    </div>
  )
}
