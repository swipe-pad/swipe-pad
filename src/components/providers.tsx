"use client"

import { ThirdwebProvider } from "thirdweb/react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { config } from "@/lib/wagmi-config"
import { useState } from "react"

import { AppProvider } from "@/context/AppContext"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <ConvexProvider client={convex}>
            <ThirdwebProvider>
                <AppProvider>
                    <WagmiProvider config={config}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </WagmiProvider>
                </AppProvider>
            </ThirdwebProvider>
        </ConvexProvider>
    )
}
