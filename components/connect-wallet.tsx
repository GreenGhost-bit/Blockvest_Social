"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Wallet, Copy, LogOut, Star, Shield, Activity, ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Algorand SDK types and utilities
interface AlgorandAccount {
  address: string
  balance: number // in microAlgos
  assets: Array<{
    'asset-id': number
    amount: number
  }>
  'min-balance': number
  'total-apps-opted-in': number
  'total-assets-opted-in': number
  'total-created-apps': number
  'total-created-assets': number
}

interface WalletState {
  address: string
  balance: string // ALGO balance
  microBalance: number // microAlgo balance
  trustScore: number
  isConnected: boolean
  walletType: WalletType | null
  account: AlgorandAccount | null
  transactionCount: number
  lastActivity: Date | null
}

type WalletType = 'pera' | 'defly' | 'algosigner' | 'myalgo' | 'exodus'

interface WalletProvider {
  name: string
  type: WalletType
  icon: string
  isAvailable: boolean
  connect: () => Promise<string[]>
  disconnect?: () => Promise<void>
}

export function ConnectWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: "",
    balance: "0",
    microBalance: 0,
    trustScore: 0,
    isConnected: false,
    walletType: null,
    account: null,
    transactionCount: 0,
    lastActivity: null,
  })
  
  const [isConnecting, setIsConnecting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<WalletProvider[]>([])
  
  const { toast } = useToast()

  // Check for available Algorand wallets
  const checkAvailableWallets = useCallback(() => {
    const wallets: WalletProvider[] = [
      {
        name: "Pera Wallet",
        type: "pera",
        icon: "🔷",
        isAvailable: typeof window !== 'undefined' && 'PeraWallet' in window,
        connect: async () => {
          if (!window.PeraWallet) throw new Error("Pera Wallet not found")
          const peraWallet = new window.PeraWallet.default()
          return await peraWallet.connect()
        },
        disconnect: async () => {
          if (window.PeraWallet) {
            const peraWallet = new window.PeraWallet.default()
            await peraWallet.disconnect()
          }
        }
      },
      {
        name: "Defly Wallet",
        type: "defly",
        icon: "🦋",
        isAvailable: typeof window !== 'undefined' && 'DeflyWalletConnect' in window,
        connect: async () => {
          if (!window.DeflyWalletConnect) throw new Error("Defly Wallet not found")
          const defly = window.DeflyWalletConnect.init()
          return await defly.connect()
        }
      },
      {
        name: "AlgoSigner", 
        type: "algosigner",
        icon: "🔐",
        isAvailable: typeof window !== 'undefined' && 'AlgoSigner' in window,
        connect: async () => {
          if (!window.AlgoSigner) throw new Error("AlgoSigner not found")
          await window.AlgoSigner.connect()
          return await window.AlgoSigner.accounts({ ledger: 'MainNet' })
        }
      }
    ]

    setAvailableWallets(wallets.filter(wallet => wallet.isAvailable))
  }, [])

  // Fetch account information from Algorand node
  const fetchAccountInfo = async (address: string): Promise<AlgorandAccount | null> => {
    try {
      // Using AlgoNode API (free Algorand node service)
      const response = await fetch(`https://mainnet-api.algonode.cloud/v2/accounts/${address}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account info: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.account || data
    } catch (error) {
      console.error('Error fetching account info:', error)
      return null
    }
  }

  // Calculate trust score based on account activity
  const calculateTrustScore = (account: AlgorandAccount): number => {
    if (!account) return 0

    let score = 0
    
    // Base score for having an active account
    score += 20
    
    // Points for account age and balance
    const algoBalance = account.balance / 1000000 // Convert microAlgos to ALGOs
    if (algoBalance > 0) score += Math.min(algoBalance * 2, 30)
    
    // Points for opted-in assets and apps (shows ecosystem participation)
    score += Math.min(account['total-assets-opted-in'] * 5, 25)
    score += Math.min(account['total-apps-opted-in'] * 3, 15)
    
    // Points for created assets/apps (shows development activity)
    score += account['total-created-assets'] * 10
    score += account['total-created-apps'] * 10
    
    return Math.min(Math.round(score), 100)
  }

  // Connect to specific wallet
  const connectWallet = async (walletProvider: WalletProvider) => {
    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await walletProvider.connect()
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in wallet")
      }

      const address = accounts[0]
      setIsLoading(true)

      // Fetch detailed account information
      const accountInfo = await fetchAccountInfo(address)
      
      if (!accountInfo) {
        throw new Error("Failed to fetch account information")
      }

      const algoBalance = (accountInfo.balance / 1000000).toFixed(6)
      const trustScore = calculateTrustScore(accountInfo)

      setWallet({
        address,
        balance: algoBalance,
        microBalance: accountInfo.balance,
        trustScore,
        isConnected: true,
        walletType: walletProvider.type,
        account: accountInfo,
        transactionCount: accountInfo['total-apps-opted-in'] + accountInfo['total-assets-opted-in'],
        lastActivity: new Date(),
      })

      toast({
        title: "Wallet Connected Successfully! 🎉",
        description: `Connected to ${walletProvider.name} with ${algoBalance} ALGO`,
      })

    } catch (error: any) {
      const errorMessage = error.message || "Failed to connect wallet"
      setError(errorMessage)
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
      setIsLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      const currentWallet = availableWallets.find(w => w.type === wallet.walletType)
      if (currentWallet?.disconnect) {
        await currentWallet.disconnect()
      }

      setWallet({
        address: "",
        balance: "0",
        microBalance: 0,
        trustScore: 0,
        isConnected: false,
        walletType: null,
        account: null,
        transactionCount: 0,
        lastActivity: null,
      })

      setError(null)
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been safely disconnected",
      })
    } catch (error: any) {
      toast({
        title: "Disconnection Error",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      })
    }
  }

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address)
      toast({
        title: "Address Copied! 📋",
        description: "Algorand address copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  // Refresh account data
  const refreshAccount = async () => {
    if (!wallet.isConnected || !wallet.address) return

    setIsLoading(true)
    try {
      const accountInfo = await fetchAccountInfo(wallet.address)
      if (accountInfo) {
        const algoBalance = (accountInfo.balance / 1000000).toFixed(6)
        const trustScore = calculateTrustScore(accountInfo)

        setWallet(prev => ({
          ...prev,
          balance: algoBalance,
          microBalance: accountInfo.balance,
          trustScore,
          account: accountInfo,
          lastActivity: new Date(),
        }))

        toast({
          title: "Account Refreshed",
          description: "Account information updated successfully",
        })
      }
    } catch (error: any) {
      toast({
        title: "Refresh Failed", 
        description: error.message || "Failed to refresh account data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format Algorand address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Get trust score color
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400" 
    if (score >= 40) return "text-orange-400"
    return "text-red-400"
  }

  // Initialize wallet detection
  useEffect(() => {
    checkAvailableWallets()
  }, [checkAvailableWallets])

  // Auto-refresh account data every 30 seconds when connected
  useEffect(() => {
    if (!wallet.isConnected) return

    const interval = setInterval(refreshAccount, 30000)
    return () => clearInterval(interval)
  }, [wallet.isConnected, wallet.address])

  // Show error alert if any
  if (error) {
    return (
      <Alert className="border-red-500/20 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-400">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError(null)}
            className="ml-2 h-auto p-1 text-red-400 hover:text-red-300"
          >
            Dismiss
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Show wallet selection if not connected
  if (!wallet.isConnected) {
    return (
      <div className="flex flex-col gap-3">
        {availableWallets.length === 0 ? (
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              No Algorand wallets detected. Please install Pera Wallet, Defly, or AlgoSigner.
            </AlertDescription>
          </Alert>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={isConnecting}
                className="bg-gradient-to-r from-golden-yellow to-yellow-400 hover:from-yellow-400 hover:to-golden-yellow text-navy-dark font-semibold transition-all duration-300"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Algorand Wallet
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-navy-dark border-blockchain-green/20">
              <div className="p-2">
                <p className="text-sm text-gray-400 mb-3 px-2">Choose your Algorand wallet:</p>
                {availableWallets.map((walletProvider) => (
                  <DropdownMenuItem 
                    key={walletProvider.type}
                    onClick={() => connectWallet(walletProvider)}
                    className="cursor-pointer hover:bg-blockchain-green/20 transition-colors"
                  >
                    <span className="mr-3 text-lg">{walletProvider.icon}</span>
                    <span className="font-medium">{walletProvider.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    )
  }

  // Show connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="border-2 border-blockchain-green/30 hover:border-blockchain-green bg-blockchain-green/5 hover:bg-blockchain-green/10 transition-all duration-300"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blockchain-green rounded-full animate-pulse" />
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blockchain-green" />}
            </div>
            <span className="hidden sm:inline font-mono text-sm">
              {formatAddress(wallet.address)}
            </span>
            <Badge className="bg-golden-yellow/20 text-golden-yellow font-semibold border-golden-yellow/30">
              {parseFloat(wallet.balance).toFixed(2)} ALGO
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-navy-dark border-blockchain-green/20">
        <div className="p-4 space-y-4">
          {/* Wallet Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-blockchain-green" />
              <span className="font-semibold text-blockchain-green">
                {availableWallets.find(w => w.type === wallet.walletType)?.name}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshAccount}
              disabled={isLoading}
              className="h-auto p-1 hover:bg-blockchain-green/20"
            >
              <Activity className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <Separator className="bg-blockchain-green/20" />

          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Algorand Address</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyAddress} 
                className="h-auto p-1 hover:bg-blockchain-green/20"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="font-mono text-xs bg-gray-800 p-2 rounded border">
              {wallet.address}
            </div>
          </div>

          {/* Balance & Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-400">ALGO Balance</span>
              <div className="font-bold text-golden-yellow">
                {parseFloat(wallet.balance).toFixed(6)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Trust Score</span>
              <div className={`font-bold ${getTrustScoreColor(wallet.trustScore)} flex items-center space-x-1`}>
                <Star className="w-3 h-3 fill-current" />
                <span>{wallet.trustScore}/100</span>
              </div>
            </div>
          </div>

          {/* Account Activity */}
          {wallet.account && (
            <div className="space-y-2">
              <span className="text-sm text-gray-400">Account Activity</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Assets:</span>
                  <span>{wallet.account['total-assets-opted-in']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Apps:</span>
                  <span>{wallet.account['total-apps-opted-in']}</span>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-blockchain-green/20" />

          {/* Actions */}
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-blockchain-green/30 text-blockchain-green hover:bg-blockchain-green hover:text-navy-dark transition-all"
              asChild
            >
              <a 
                href={`https://allo.info/account/${wallet.address}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                View on AlloInfo
              </a>
            </Button>
            
            <DropdownMenuItem 
              onClick={disconnectWallet} 
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 cursor-pointer w-full justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}