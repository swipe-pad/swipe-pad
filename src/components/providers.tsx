"use client"

import { ThirdwebProvider } from "thirdweb/react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { config } from "@/lib/wagmi-config"
import { useState } from "react"

import { AppProvider } from "@/context/AppContext"
import { ProjectsProvider } from "@/lib/useConvexData"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                gcTime: 5 * 60_000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: 1,
            },
        },
    }))

    return (
        <ConvexProvider client={convex}>
            <ThirdwebProvider>
                <ProjectsProvider>
                    <AppProvider>
                        <WagmiProvider config={config}>
                            <QueryClientProvider client={queryClient}>
                                {children}
                            </QueryClientProvider>
                        </WagmiProvider>
                    </AppProvider>
                </ProjectsProvider>
            </ThirdwebProvider>
        </ConvexProvider>
    )
}
