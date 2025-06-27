import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { WalletProvider } from "@/components/wallet-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
})

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-body",
})

export const metadata: Metadata = {
  title: "Blockvest Social - Decentralized Micro-Investment Platform",
  description: "Empowering entrepreneurs through blockchain-based micro-investments and DeFi solutions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} font-body bg-navy-dark text-white min-h-screen`}>
        <WalletProvider>
          <Navigation />
          <main className="pt-16">{children}</main>
        </WalletProvider>
      </body>
    </html>
  )
}
