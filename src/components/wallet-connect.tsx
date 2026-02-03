"use client"

import { useEffect, useState } from "react"
import { useConnect, useAccount as useWagmiAccount } from "wagmi"
import { injected } from "wagmi/connectors"
import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"
import { inAppWallet, createWallet } from "thirdweb/wallets"
import { isMiniPay, isFarcaster } from "@/lib/minipay-utils"
import { StarryBackground } from "./starry-background"
import { celo } from "thirdweb/chains"

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
})

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
  const [isInjectedEnv, setIsInjectedEnv] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Wagmi hooks (for MiniPay / Farcaster)
  const { connect } = useConnect()
  const { isConnected: isWagmiConnected } = useWagmiAccount()

  // Thirdweb hooks (for standard web)
  const thirdwebAccount = useActiveAccount()

  useEffect(() => {
    // Check if we are in MiniPay or Farcaster environment
    if (isMiniPay() || isFarcaster()) {
      setIsInjectedEnv(true)
    }
  }, [])

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
    <div className="relative flex flex-col items-center justify-center py-12 px-6 h-full overflow-hidden">
      <StarryBackground />

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="mb-8 flex justify-center w-full">
          <h1 className="text-4xl font-bold text-center" style={{ fontFamily: "Pixelify Sans, monospace" }}>
            SwipePad
          </h1>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">Welcome to SwipePad!</h2>
        <p className="text-gray-300 text-center mb-8 max-w-sm">
          Support regenerative projects with micro-donations through simple swipes on the Celo blockchain.
        </p>

        <div className="w-full max-w-sm flex justify-center">
          {isInjectedEnv ? (
            <button
              onClick={handleInjectedConnect}
              disabled={isConnecting}
              className="w-full bg-[#FFD600] hover:bg-[#E6C200] text-black font-bold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Enter MiniApp
                </>
              )}
            </button>
          ) : (
            <ConnectButton
              client={client}
              chain={celo}
              wallets={wallets}
              accountAbstraction={{
                chain: celo,
                sponsorGas: true, // Gasless transactions - app pays for gas!
              }}
              theme="dark"
              connectButton={{
                label: "Connect Wallet",
                className: "!bg-[#FFD600] !text-black !font-bold !py-4 !px-6 !rounded-xl !h-auto !w-full",
                style: {
                  backgroundColor: "#FFD600",
                  color: "black",
                  borderRadius: "0.75rem",
                  height: "3.5rem",
                  width: "100%",
                }
              }}
              connectModal={{
                title: "Connect to SwipePad",
                size: "compact",
              }}
              detailsButton={{
                displayBalanceToken: {
                  [celo.id]: "0x765DE816845861e75A25fCA122bb6898B8B1282a", // cUSD on Celo Mainnet
                }
              }}
            />
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            By connecting, you agree to our Terms of Service and Privacy Policy. Your funds remain secure in your
            wallet at all times.
          </p>
        </div>
      </div>
    </div>
  )
}

