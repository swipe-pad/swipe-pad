"use client"

import { useEffect, useState } from "react"
import { useConnect, useAccount, useDisconnect } from "wagmi"
import { injected } from "wagmi/connectors"
import { isMiniPay } from "@/lib/minipay-utils"
import { StarryBackground } from "./starry-background"

interface MiniPayWalletConnectProps {
  onConnect: () => void
}

export function MiniPayWalletConnect({ onConnect }: MiniPayWalletConnectProps) {
  const [hideConnectBtn, setHideConnectBtn] = useState(false)
  const { connect } = useConnect()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    console.log("[v0] MiniPay detection:", isMiniPay())
    console.log("[v0] Window.ethereum:", !!window.ethereum)

    if (isMiniPay()) {
      setHideConnectBtn(true)
      connect({ connector: injected() })
    }
  }, [connect])

  useEffect(() => {
    console.log("[v0] Wallet connected:", isConnected)
    console.log("[v0] Address:", address)

    if (isConnected && address) {
      onConnect()
    }
  }, [isConnected, address, onConnect])

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  return (
    <div className="relative flex size-full items-center justify-center">

      <div className="
        relative z-10 flex w-full max-w-md flex-col items-center justify-center
        px-8 py-12
      ">
        <h1 className="mb-4 text-center text-5xl font-bold" style={{ fontFamily: "Pixelify Sans, monospace" }}>
          SwipePad
        </h1>

        <h2 className="mb-3 text-center text-2xl font-bold text-white">Welcome to SwipePad!</h2>

        <p className="mb-8 text-center text-sm/relaxed text-gray-300">
          Support regenerative projects with micro-donations through simple swipes on the Celo blockchain.
        </p>

        {!hideConnectBtn && (
          <button
            onClick={handleConnect}
            className="
              mb-4 flex w-full items-center justify-center gap-2 rounded-xl
              bg-[#FFD600] px-6 py-4 font-bold text-black transition-all
              duration-200
              hover:bg-[#E6C200]
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7h-9" />
              <path d="M14 17H5" />
              <circle cx="17" cy="17" r="3" />
              <circle cx="7" cy="7" r="3" />
            </svg>
            Connect Wallet
          </button>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          By connecting, you agree to our Terms of Service and Privacy Policy. Your funds remain secure in your wallet
          at all times.
        </p>
      </div>
    </div>
  )
}
