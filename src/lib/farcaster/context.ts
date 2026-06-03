import type { Context } from "@farcaster/miniapp-sdk"

import { isFarcasterMiniAppFeatureEnabled } from "@/lib/farcaster/config"

export type FarcasterMiniAppContext = Context.MiniAppContext
export type HostEnvironment = "web" | "minipay" | "farcaster-miniapp"

export type FarcasterTestHostState = {
  enabled: boolean
  context?: FarcasterMiniAppContext
  composeCast?: (payload: { text?: string; embeds?: [] | [string] | [string, string] }) => Promise<void> | void
  openUrl?: (url: string) => Promise<void> | void
  ready?: () => Promise<void> | void
  addMiniApp?: () => Promise<void> | void
}

declare global {
  interface Window {
    __SWIPEPAD_FARCASTER_TEST_HOST__?: FarcasterTestHostState
    __SWIPEPAD_LAST_COMPOSE_CAST__?: {
      text?: string
      embeds?: [] | [string] | [string, string]
    }
    __SWIPEPAD_LAST_OPEN_URL__?: string
    __SWIPEPAD_LAST_ADD_MINIAPP__?: boolean
  }
}

export function getTestHostState(): FarcasterTestHostState | undefined {
  if (typeof window === "undefined") return undefined
  return window.__SWIPEPAD_FARCASTER_TEST_HOST__
}

export function hasFarcasterTestHost(): boolean {
  return Boolean(getTestHostState()?.enabled)
}

export function hasMiniPayProvider(): boolean {
  if (typeof window === "undefined") return false
  const ethereum = (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum
  return Boolean(ethereum?.isMiniPay)
}

export function hasFarcasterProviderSignal(): boolean {
  if (typeof window === "undefined") return false
  const ethereum = (window as unknown as { ethereum?: { isFarcaster?: boolean } }).ethereum
  return Boolean(ethereum?.isFarcaster)
}

export function getHostEnvironmentSync(): HostEnvironment {
  if (hasFarcasterTestHost() || hasFarcasterProviderSignal()) {
    return "farcaster-miniapp"
  }

  if (hasMiniPayProvider()) {
    return "minipay"
  }

  return "web"
}

export function canUseFarcasterMiniApp(): boolean {
  return isFarcasterMiniAppFeatureEnabled()
}
