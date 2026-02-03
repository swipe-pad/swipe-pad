import { http, createConfig } from "wagmi"
import { mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// Minimal wagmi config - only used for MiniPay/Farcaster injected wallet fallback
// Main wallet functionality is handled by thirdweb
export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
  },
})
