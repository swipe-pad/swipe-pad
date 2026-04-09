"use client"

import { useEffect } from "react"
import { useMutation } from "convex/react"
import { useShallow } from "zustand/react/shallow"

import { useApp } from "@/context/AppContext"
import { api } from "../../../../convex/_generated/api"
import { isFeatureEnabled } from "../../shared/feature-flags"

export function useGatedAccess() {
  const resolveAccess = useMutation(api.access.resolveAccess)
  const {
    walletAddress,
    accessState,
    setAccessState,
    setAccessReason,
    setBetaUserId,
    setBetaStatus,
  } = useApp(useShallow((state) => ({
    walletAddress: state.walletAddress,
    accessState: state.accessState,
    setAccessState: state.setAccessState,
    setAccessReason: state.setAccessReason,
    setBetaUserId: state.setBetaUserId,
    setBetaStatus: state.setBetaStatus,
  })))

  useEffect(() => {
    // Only run if gated access is enabled
    if (!isFeatureEnabled("gatedAccess")) {
      return
    }

    if (!walletAddress) {
      setAccessState(null)
      setAccessReason(null)
      return
    }

    let isMounted = true

    setAccessState("checking")
    
    resolveAccess({ wallet: walletAddress })
      .then((result) => {
        if (!isMounted) return
        setAccessState(result.accessState)
        setAccessReason(result.accessReason)
        if (result.userId) {
          setBetaUserId(result.userId)
          setBetaStatus(result.betaStatus)
        }
      })
      .catch((error) => {
        if (!isMounted) return
        console.error("[gated-access] Failed to resolve access:", error)
        setAccessState("denied")
        setAccessReason("resolution_failed")
      })

    return () => {
      isMounted = false
    }
  }, [walletAddress, resolveAccess, setAccessState, setAccessReason, setBetaUserId, setBetaStatus])

  return { accessState }
}
