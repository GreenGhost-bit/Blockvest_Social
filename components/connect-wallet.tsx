"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet, Copy, LogOut, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletState {
  address: string
  balance: string
  trustScore: number
  isConnected: boolean
}

export function ConnectWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: "",
    balance: "0",
    trustScore: 0,
    isConnected: false,
  })
  const { toast } = useToast()

  const connectWallet = async () => {
    // Simulate wallet connection
    setTimeout(() => {
      setWallet({
        address: "0x742d35Cc6634C0532925a3b8D4C2C4e4C4C4C4C4",
        balance: "2.45",
        trustScore: 87,
        isConnected: true,
      })
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      })
    }, 1000)
  }

  const disconnectWallet = () => {
    setWallet({
      address: "",
      balance: "0",
      trustScore: 0,
      isConnected: false,
    })
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!wallet.isConnected) {
    return (
      <Button onClick={connectWallet} className="bg-golden-yellow hover:bg-golden-yellow/90 text-navy-dark font-medium">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-blockchain-green/30 hover:border-blockchain-green">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blockchain-green rounded-full animate-pulse" />
            <span className="hidden sm:inline">{formatAddress(wallet.address)}</span>
            <Badge variant="secondary" className="bg-blockchain-green/20 text-blockchain-green">
              {wallet.balance} ETH
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-navy-dark border-blockchain-green/20">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Address</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-auto p-1">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="font-mono text-sm">{formatAddress(wallet.address)}</div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="font-medium">{wallet.balance} ETH</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Trust Score</span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-golden-yellow fill-current" />
              <span className="font-medium">{wallet.trustScore}/100</span>
            </div>
          </div>
        </div>

        <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 hover:text-red-300">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
