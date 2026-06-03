"use client"

import sdk from "@farcaster/miniapp-sdk"

import {
  canUseFarcasterMiniApp,
  getTestHostState,
  type FarcasterMiniAppContext,
} from "@/lib/farcaster/context"

let readyPromise: Promise<void> | null = null
let contextPromise: Promise<FarcasterMiniAppContext | null> | null = null

export async function isInFarcasterMiniApp(): Promise<boolean> {
  if (!canUseFarcasterMiniApp()) return false

  const testHost = getTestHostState()
  if (testHost?.enabled) {
    return true
  }

  try {
    return await sdk.isInMiniApp()
  } catch {
    return false
  }
}

export async function getMiniAppContext(): Promise<FarcasterMiniAppContext | null> {
  if (!canUseFarcasterMiniApp()) return null

  const testHost = getTestHostState()
  if (testHost?.enabled) {
    return testHost.context ?? null
  }

  if (!contextPromise) {
    contextPromise = sdk.context.then((context) => context ?? null).catch(() => null)
  }

  return contextPromise
}

export async function readyMiniApp(): Promise<void> {
  if (!canUseFarcasterMiniApp()) return
  if (!(await isInFarcasterMiniApp())) return

  const testHost = getTestHostState()
  if (testHost?.enabled) {
    await testHost.ready?.()
    return
  }

  if (!readyPromise) {
    readyPromise = sdk.actions.ready().catch((error) => {
      readyPromise = null
      throw error
    })
  }

  await readyPromise
}

export async function addMiniApp(): Promise<void> {
  if (!canUseFarcasterMiniApp()) {
    throw new Error("Farcaster Mini App support disabled")
  }

  const testHost = getTestHostState()
  if (testHost?.enabled) {
    window.__SWIPEPAD_LAST_ADD_MINIAPP__ = true
    await testHost.addMiniApp?.()
    return
  }

  await sdk.actions.addMiniApp()
}

export async function getMiniAppEthereumProvider() {
  const testHost = getTestHostState()
  if (testHost?.enabled && typeof window !== "undefined") {
    const ethereum = (window as unknown as { ethereum?: unknown }).ethereum
    if (ethereum) return ethereum
  }

  try {
    return await sdk.wallet.getEthereumProvider()
  } catch {
    return undefined
  }
}
