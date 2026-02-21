import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Swipe Pad",
  description: "Swipe to support regenerative projects on Celo",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="h-screen w-screen overflow-hidden text-white antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}