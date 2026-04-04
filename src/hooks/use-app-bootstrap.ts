"use client"

import { useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount as useWagmiAccount } from "wagmi"
import { useShallow } from "zustand/react/shallow"

import { useApp } from "@/context/AppContext"
import { getDevGuestProvisioningEnabled } from "@/lib/dev-guest-provisioning"
import { getMiniAppContext, isInFarcasterMiniApp } from "@/lib/farcaster/client"
import { useGatedAccess } from "@/features/gated-access"
import { api } from "../../convex/_generated/api"

const GUEST_WALLET_STORAGE_KEY = "swipepad:guest-wallet"

function createGuestWalletId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `guest-${crypto.randomUUID()}`
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getOrCreateGuestWalletId() {
  if (typeof window === "undefined") return null

  const storedGuestWallet = window.localStorage.getItem(GUEST_WALLET_STORAGE_KEY)
  if (storedGuestWallet) return storedGuestWallet

  const guestWallet = createGuestWalletId()
  window.localStorage.setItem(GUEST_WALLET_STORAGE_KEY, guestWallet)
  return guestWallet
}

export function useAppBootstrap() {
  const thirdwebAccount = useActiveAccount()
  const { address: wagmiAddress } = useWagmiAccount()
  const ensureGuestUser = useMutation(api.waitlist.ensureGuestUser)

  const {
    walletAddress,
    setWalletConnected,
    setWalletAddress,
    setBetaUserId,
    setBetaStatus,
    setCreditsRemaining,
    setCreditsMax,
  } = useApp(useShallow((state) => ({
    walletAddress: state.walletAddress,
    setWalletConnected: state.setWalletConnected,
    setWalletAddress: state.setWalletAddress,
    setBetaUserId: state.setBetaUserId,
    setBetaStatus: state.setBetaStatus,
    setCreditsRemaining: state.setCreditsRemaining,
    setCreditsMax: state.setCreditsMax,
  })))

  const [allowGuestProvisioning, setAllowGuestProvisioning] = useState(false)

  useEffect(() => {
    isInFarcasterMiniApp()
      .then((isMiniApp) => {
        if (!isMiniApp) return null
        return getMiniAppContext()
      })
      .catch((error) => {
        console.error("[farcaster] bootstrap context failed", error)
      })
  }, [])

  useEffect(() => {
    const sync = () => setAllowGuestProvisioning(getDevGuestProvisioningEnabled())
    sync()

    const onStorage = (event: StorageEvent) => {
      if (event.key !== "swipepad.devGuestProvisioning") return
      sync()
    }
    const onCustom = () => sync()

    window.addEventListener("storage", onStorage)
    window.addEventListener("swipepad:guest-provisioning-change", onCustom)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("swipepad:guest-provisioning-change", onCustom)
    }
  }, [])

  useEffect(() => {
    const guestWallet = allowGuestProvisioning ? getOrCreateGuestWalletId() : null
    const nextAddress = thirdwebAccount?.address ?? wagmiAddress ?? guestWallet
    setWalletConnected(Boolean(nextAddress))
    setWalletAddress(nextAddress)
  }, [allowGuestProvisioning, thirdwebAccount?.address, wagmiAddress, setWalletAddress, setWalletConnected])

  // Gated access integration (additive - only activates when feature flag is enabled)
  useGatedAccess()

  useEffect(() => {
    const hasConnectedWallet = Boolean(thirdwebAccount?.address ?? wagmiAddress)

    if (!walletAddress || (!allowGuestProvisioning && !hasConnectedWallet)) {
      setBetaUserId(null)
      setBetaStatus(null)
      setCreditsRemaining(0)
      setCreditsMax(0)
      return
    }

    let isMounted = true

    ensureGuestUser({ wallet: walletAddress, chain: "celo" })
      .then((result) => {
        if (!isMounted) return
        setBetaUserId(result.userId)
        setBetaStatus(result.status)
        setCreditsRemaining(result.remaining)
        setCreditsMax(result.max)
      })
      .catch((error) => {
        console.error("Failed to initialize beta user:", error)
      })

    return () => {
      isMounted = false
    }
  }, [
    allowGuestProvisioning,
    thirdwebAccount?.address,
    wagmiAddress,
    walletAddress,
    ensureGuestUser,
    setBetaUserId,
    setBetaStatus,
    setCreditsRemaining,
    setCreditsMax,
  ])
}
