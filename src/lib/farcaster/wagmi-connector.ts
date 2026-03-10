"use client"

import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector"
import { injected } from "wagmi/connectors"

import { getMiniAppEthereumProvider, isInFarcasterMiniApp } from "@/lib/farcaster/client"
import { hasFarcasterTestHost } from "@/lib/farcaster/context"

export async function getFarcasterConnector() {
  if (hasFarcasterTestHost()) {
    return injected({
      target() {
        return {
          id: "farcaster-test-host",
          name: "Farcaster Test Host",
          provider: window.ethereum,
        }
      },
    })
  }

  if (await isInFarcasterMiniApp()) {
    const provider = await getMiniAppEthereumProvider()
    if (provider) {
      return farcasterMiniApp()
    }
  }

  return injected()
}
