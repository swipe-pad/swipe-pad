"use client"

import type { FarcasterMiniAppContext, FarcasterTestHostState } from "@/lib/farcaster/context"

import { APP_ORIGINS } from "@/config/app-urls"

const TEST_HOST_QUERY_PARAM = "__test_farcaster"
const TEST_HOST_ADDED_QUERY_PARAM = "__test_farcaster_added"
const TEST_HOST_ADDRESS = "0x1111111111111111111111111111111111111111"
const TEST_HOST_CHAIN_ID = "0xa4ec"

function getDefaultContext(): FarcasterMiniAppContext {
  return {
    client: {
      clientFid: 9152,
      added: true,
      platformType: "web",
    },
    user: {
      fid: 4242,
      username: "swipepad-test",
      displayName: "SwipePad Test",
      pfpUrl: `${APP_ORIGINS.canonical}/icons/favicon-256x256.png`,
    },
    location: {
      type: "cast_share",
      cast: {
        author: {
          fid: 4242,
          username: "swipepad-test",
        },
        hash: "0xtest",
        text: "Testing SwipePad",
      },
    },
    features: {
      haptics: true,
    },
  }
}

function shouldEnableTestHost(): boolean {
  if (typeof window === "undefined") return false
  const url = new URL(window.location.href)
  return url.searchParams.get(TEST_HOST_QUERY_PARAM) === "1"
}

function getInitialAddedState(): boolean {
  if (typeof window === "undefined") return true
  const url = new URL(window.location.href)
  return url.searchParams.get(TEST_HOST_ADDED_QUERY_PARAM) !== "0"
}

function createMockEthereumProvider() {
  let selectedAddress = TEST_HOST_ADDRESS
  let currentChainId = TEST_HOST_CHAIN_ID
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>()

  const emit = (event: string, ...args: unknown[]) => {
    const handlers = listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      handler(...args)
    }
  }

  return {
    isFarcaster: true,
    request: async ({
      method,
      params,
    }: {
      method: string
      params?: unknown[]
    }) => {
      switch (method) {
        case "eth_requestAccounts":
        case "eth_accounts":
          return [selectedAddress]
        case "eth_chainId":
          return currentChainId
        case "wallet_switchEthereumChain": {
          const next = (params?.[0] as { chainId?: string } | undefined)?.chainId
          if (next) {
            currentChainId = next
            emit("chainChanged", currentChainId)
          }
          return null
        }
        case "eth_sendTransaction":
          return "0xtesthash"
        default:
          return null
      }
    },
    on(event: string, handler: (...args: unknown[]) => void) {
      const bucket = listeners.get(event) ?? new Set()
      bucket.add(handler)
      listeners.set(event, bucket)
    },
    removeListener(event: string, handler: (...args: unknown[]) => void) {
      listeners.get(event)?.delete(handler)
    },
    disconnect() {
      selectedAddress = TEST_HOST_ADDRESS
      emit("disconnect")
    },
  }
}

export function installFarcasterTestHost(): FarcasterTestHostState | null {
  if (typeof window === "undefined") return null
  if (!shouldEnableTestHost()) return null
  if (window.__SWIPEPAD_FARCASTER_TEST_HOST__?.enabled) {
    return window.__SWIPEPAD_FARCASTER_TEST_HOST__
  }

  const context = getDefaultContext()
  context.client.added = getInitialAddedState()
  const provider = createMockEthereumProvider()

  window.ethereum = provider
  window.__SWIPEPAD_FARCASTER_TEST_HOST__ = {
    enabled: true,
    context,
    ready: async () => undefined,
    addMiniApp: async () => {
      context.client.added = true
      window.__SWIPEPAD_LAST_ADD_MINIAPP__ = true
    },
    composeCast: async (payload) => {
      window.__SWIPEPAD_LAST_COMPOSE_CAST__ = payload
    },
    openUrl: async (url) => {
      window.__SWIPEPAD_LAST_OPEN_URL__ = url
    },
  }

  return window.__SWIPEPAD_FARCASTER_TEST_HOST__
}
