import type { Metadata } from "next"
import { Nunito, Press_Start_2P } from "next/font/google"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import "./globals.css"

const bodyFont = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const displayFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://app.swipepad.xyz"),
  title: "SwipePad | Support Regenerative Projects",
  description: "Swipe to discover and fund the best regenerative projects and builders in web3.",
  keywords: ["SwipePad", "Celo", "ReFi", "Web3", "Donations", "Funding"],
  applicationName: "SwipePad",
  appleWebApp: {
    capable: true,
    title: "SwipePad",
    statusBarStyle: "black-translucent",
  },
  authors: [{ name: "SwipePad Team" }],
  generator: "Next.js",
  openGraph: {
    type: "website",
    url: "https://swipepad.app",
    title: "SwipePad | Support Regenerative Projects",
    description: "Swipe to discover and fund the best regenerative projects and builders in web3.",
    siteName: "SwipePad",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "SwipePad - Fund regenerative projects with crypto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwipePad | Support Regenerative Projects",
    description: "Swipe to discover and fund the best regenerative projects and builders in web3.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          bodyFont.variable,
          displayFont.variable,
          "h-screen w-screen overflow-hidden text-white antialiased"
        )}
      >
        <Providers>{children}</Providers>
        {/* <Analytics /> */}
      </body>
    </html>
  )
}
