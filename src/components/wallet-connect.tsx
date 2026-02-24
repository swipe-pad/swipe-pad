"use client"

import { useEffect, useMemo, useState } from "react"
import { useConnect, useAccount as useWagmiAccount } from "wagmi"
import { injected } from "wagmi/connectors"
import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { inAppWallet, createWallet } from "thirdweb/wallets"
import { isMiniPay, isFarcaster } from "@/lib/minipay-utils"
import { client } from "@/lib/thirdweb-client"
import { celo } from "thirdweb/chains"

// Configure wallets with in-app wallet for easy onboarding
const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "email", "guest"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
]

interface WalletConnectProps {
  onConnect: () => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const isInjectedEnv = useMemo(() => isMiniPay() || isFarcaster(), [])
  const [isConnecting, setIsConnecting] = useState(false)

  // Wagmi hooks (for MiniPay / Farcaster)
  const { connect } = useConnect()
  const { isConnected: isWagmiConnected } = useWagmiAccount()

  // Thirdweb hooks (for standard web)
  const thirdwebAccount = useActiveAccount()

  useEffect(() => {
    if (isWagmiConnected || thirdwebAccount) {
      onConnect()
    }
  }, [isWagmiConnected, thirdwebAccount, onConnect])

  const handleInjectedConnect = () => {
    setIsConnecting(true)
    connect({ connector: injected() }, {
      onSuccess: () => {
        setIsConnecting(false)
      },
      onError: (error) => {
        console.error("Connection failed:", error)
        setIsConnecting(false)
      }
    })
  }

  return (
    <div className="
      relative flex h-full flex-col items-center justify-center overflow-hidden
      px-6 py-12
    ">
      <div className="
        relative z-10 flex flex-1 flex-col items-center justify-center
      ">
        <div className="mb-8 flex w-full justify-center">
          <h1 className="font-display text-center text-4xl font-bold tracking-widest">
            SwipePad
          </h1>
        </div>

        <h2 className="mb-2 text-center text-2xl font-bold">Welcome to SwipePad!</h2>
        <p className="mb-8 max-w-sm text-center text-gray-300">
          Support regenerative projects with micro-donations through simple swipes on the Celo blockchain.
        </p>

        <div className="w-full max-w-sm">
          {isInjectedEnv ? (
            <button
              onClick={handleInjectedConnect}
              disabled={isConnecting}
              className="
                mb-4 flex w-full items-center justify-center gap-2 rounded-xl
                bg-[#FFD600] px-6 py-4 font-bold text-black transition-all
                duration-200
                hover:bg-[#E6C200]
              "
            >
              {isConnecting ? (
                <>
                  <div className="
                    mr-2 size-5 animate-spin rounded-full border-b-2
                    border-black
                  "></div>
                  Connecting...
                </>
              ) : (
                <>
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
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" x2="3" y1="12" y2="12" />
                  </svg>
                  Enter App
                </>
              )}
            </button>
          ) : (
            <div className="flex w-full justify-center">
              <ConnectButton
                client={client}
                chain={celo}
                wallets={wallets}
                accountAbstraction={{
                  chain: celo,
                  sponsorGas: true,
                }}
                theme="dark"
                connectButton={{
                  label: "Enter App",
                  className: "!bg-[#FFD600] !text-black !font-bold !py-4 !px-6 !rounded-xl !h-auto !w-full !flex !items-center !justify-center !gap-2",
                  style: {
                    backgroundColor: "#FFD600",
                    color: "black",
                    borderRadius: "0.75rem",
                    height: "3.5rem",
                    width: "100%",
                  }
                }}
                connectModal={{
                  title: "Enter SwipePad",
                  size: "compact",
                }}
                detailsButton={{
                  displayBalanceToken: {
                    [celo.id]: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
                  }
                }}
              />
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="mx-auto max-w-xs text-xs text-gray-400">
              By connecting, you agree to our Terms of Service and Privacy Policy. Your funds remain secure in your
              wallet at all times.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
