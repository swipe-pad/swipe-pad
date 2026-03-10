import { http, createConfig } from "wagmi"
import { base, celo, mainnet } from "wagmi/chains"
import { injected } from "wagmi/connectors"

export const config = createConfig({
  chains: [celo, base, mainnet],
  connectors: [injected()],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
  },
})
