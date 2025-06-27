"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Toaster } from "@/components/ui/toaster"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  trustScore: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState] = useState<WalletContextType>({
    isConnected: false,
    address: null,
    balance: "0",
    trustScore: 0,
  })

  return (
    <WalletContext.Provider value={walletState}>
      {children}
      <Toaster />
    </WalletContext.Provider>
  )
}
