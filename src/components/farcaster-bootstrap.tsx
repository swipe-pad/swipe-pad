"use client"

import { useEffect } from "react"

import { readyMiniApp } from "@/lib/farcaster/client"
import { installFarcasterTestHost } from "@/lib/farcaster/test-host"

export function FarcasterBootstrap() {
  useEffect(() => {
    installFarcasterTestHost()
    readyMiniApp().catch((error) => {
      console.error("[farcaster] mini app ready failed", error)
    })
  }, [])

  return null
}
