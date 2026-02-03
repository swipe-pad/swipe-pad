"use client"

import { ThirdwebProvider } from "thirdweb/react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from "@/lib/wagmi-config"
import { useState } from "react"

import { AppProvider } from "@/context/AppContext"

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())

    return (
        <ThirdwebProvider>
            <AppProvider>
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        {children}
                    </QueryClientProvider>
                </WagmiProvider>
            </AppProvider>
        </ThirdwebProvider>
    )
}
