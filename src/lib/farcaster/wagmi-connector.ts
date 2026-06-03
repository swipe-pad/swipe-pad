"use client"

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { injected } from "wagmi/connectors"

import { getMiniAppEthereumProvider, isInFarcasterMiniApp } from "@/lib/farcaster/client"
import { hasFarcasterTestHost } from "@/lib/farcaster/context"

export async function getFarcasterConnector(): Promise<ReturnType<typeof injected>> {
  if (hasFarcasterTestHost()) {
    const ethereum = (window as unknown as { ethereum?: unknown }).ethereum
    return injected({
      target() {
        return {
          id: "farcaster-test-host",
          name: "Farcaster Test Host",
          provider: ethereum,
        }
      },
    } as Parameters<typeof injected>[0]) as unknown as ReturnType<typeof injected>
  }

  if (await isInFarcasterMiniApp()) {
    const provider = await getMiniAppEthereumProvider()
    if (provider) {
      return farcasterMiniApp() as unknown as ReturnType<typeof injected>
    }
  }

  return injected()
}
