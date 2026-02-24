"use client"

import { useEffect } from "react"
import { useMutation } from "convex/react"
import { useActiveAccount } from "thirdweb/react"
import { useAccount as useWagmiAccount } from "wagmi"
import { useShallow } from "zustand/react/shallow"

import { useApp } from "@/context/AppContext"
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

  useEffect(() => {
    const guestWallet = getOrCreateGuestWalletId()
    const nextAddress = thirdwebAccount?.address ?? wagmiAddress ?? guestWallet
    setWalletConnected(Boolean(nextAddress))
    setWalletAddress(nextAddress)
  }, [thirdwebAccount?.address, wagmiAddress, setWalletAddress, setWalletConnected])

  useEffect(() => {
    if (!walletAddress) return

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
    walletAddress,
    ensureGuestUser,
    setBetaUserId,
    setBetaStatus,
    setCreditsRemaining,
    setCreditsMax,
  ])
}
