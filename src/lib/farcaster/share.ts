"use client"

import sdk from "@farcaster/miniapp-sdk"

import { getAppUrl } from "@/lib/farcaster/config"
import { getTestHostState, type HostEnvironment } from "@/lib/farcaster/context"

export type FarcasterSharePayload = {
  url: string
  text?: string
}

function encodeWarpcastComposeUrl({ url, text }: FarcasterSharePayload): string {
  const composeUrl = new URL("https://warpcast.com/~/compose")
  if (text) {
    composeUrl.searchParams.set("text", text)
  }
  composeUrl.searchParams.set("embeds[]", url)
  return composeUrl.toString()
}

export function getCanonicalShareUrl(projectKey: string): string {
  return `${getAppUrl()}/p/${encodeURIComponent(projectKey)}`
}

export async function openWarpcastComposer(payload: FarcasterSharePayload): Promise<void> {
  const testHost = getTestHostState()
  const composePayload = {
    text: payload.text,
    embeds: [payload.url] as [string],
  }

  if (testHost?.enabled) {
    window.__SWIPEPAD_LAST_COMPOSE_CAST__ = composePayload
    await testHost.composeCast?.(composePayload)
    return
  }

  try {
    await sdk.actions.composeCast(composePayload)
    return
  } catch {
    const fallbackUrl = encodeWarpcastComposeUrl(payload)
    await sdk.actions.openUrl(fallbackUrl)
  }
}

export async function shareProjectInHost({
  hostEnvironment,
  payload,
}: {
  hostEnvironment: HostEnvironment
  payload: FarcasterSharePayload
}): Promise<"farcaster" | "browser"> {
  if (hostEnvironment === "farcaster-miniapp") {
    await openWarpcastComposer(payload)
    return "farcaster"
  }

  return "browser"
}
