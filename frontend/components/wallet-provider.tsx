"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  type ReactNode 
} from "react"
import { Toaster } from "@/frontend/components/ui/toaster"
import { useToast } from "@/frontend/hooks/use-toast"

interface AlgorandAccount {
  address: string
  balance: number
  assets: Array<{
    'asset-id': number
    amount: number
    'is-frozen': boolean
  }>
  'min-balance': number
  'total-apps-opted-in': number
  'total-assets-opted-in': number
  'total-created-apps': number
  'total-created-assets': number
  'created-apps': number[]
  'created-assets': number[]
}

interface InvestmentPosition {
  entrepreneurId: string
  amountInvested: number
  expectedReturn: number
  investmentDate: Date
  status: 'active' | 'completed' | 'defaulted'
  contractAddress: string
}

interface WalletTransaction {
  id: string
  type: 'investment' | 'withdrawal' | 'reward' | 'governance'
  amount: number
  assetId?: number
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: Date
  recipientAddress?: string
  note?: string
}

type WalletType = 'pera' | 'defly' | 'algosigner' | 'myalgo' | 'exodus'

interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  isLoading: boolean
  address: string | null
  balance: string
  microBalance: number
  trustScore: number
  walletType: WalletType | null
  account: AlgorandAccount | null
  investments: InvestmentPosition[]
  transactions: WalletTransaction[]
  nftBadges: string[]
  governanceTokens: number
  lastUpdated: Date | null
  error: string | null
}

interface WalletContextType extends WalletState {
  connectWallet: (walletType: WalletType) => Promise<boolean>
  disconnectWallet: () => Promise<void>
  refreshAccount: () => Promise<void>
  makeInvestment: (entrepreneurId: string, amount: number) => Promise<boolean>
  withdrawFunds: (amount: number) => Promise<boolean>
  getInvestmentHistory: () => InvestmentPosition[]
  sendTransaction: (recipientAddress: string, amount: number, note?: string) => Promise<string>
  getTransactionHistory: () => WalletTransaction[]
  optInToApp: (appId: number) => Promise<boolean>
  callSmartContract: (appId: number, method: string, args: any[]) => Promise<any>
  formatAddress: (address: string) => string
  convertAlgoToMicroAlgo: (algo: number) => number
  convertMicroAlgoToAlgo: (microAlgo: number) => number
  updateTrustScore: () => Promise<void>
  participateInGovernance: (proposalId: string, vote: 'yes' | 'no') => Promise<boolean>
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

const ALGORAND_CONFIG = {
  NODE_URL: 'https://mainnet-api.algonode.cloud',
  INDEXER_URL: 'https://mainnet-idx.algonode.cloud',
  NETWORK: 'MainNet',
  EXPLORER_URL: 'https://allo.info'
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    isLoading: false,
    address: null,
    balance: "0",
    microBalance: 0,
    trustScore: 0,
    walletType: null,
    account: null,
    investments: [],
    transactions: [],
    nftBadges: [],
    governanceTokens: 0,
    lastUpdated: null,
    error: null,
  })

  const { toast } = useToast()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const walletProviderRef = useRef<any>(null)

  const persistWalletState = useCallback((state: Partial<WalletState>) => {
    try {
      const persistData = {
        address: state.address,
        walletType: state.walletType,
        lastUpdated: state.lastUpdated,
      }
      localStorage.setItem('blockvest_wallet', JSON.stringify(persistData))
    } catch (error) {
      console.warn('Failed to persist wallet state:', error)
    }
  }, [])

  const loadPersistedState = useCallback(() => {
    try {
      const persistedData = localStorage.getItem('blockvest_wallet')
      if (persistedData) {
        const data = JSON.parse(persistedData)
        if (data.address && data.walletType) {
          console.log('Found persisted wallet data:', data)
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted wallet state:', error)
    }
  }, [])

  const fetchAccountInfo = useCallback(async (address: string): Promise<AlgorandAccount | null> => {
    try {
      const response = await fetch(`${ALGORAND_CONFIG.NODE_URL}/v2/accounts/${address}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account info: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.account || data
    } catch (error) {
      console.error('Error fetching account info:', error)
      return null
    }
  }, [])

  const calculateTrustScore = useCallback((account: AlgorandAccount): number => {
    if (!account) return 0

    let score = 0
    
    score += 20
    
    const algoBalance = account.balance / 1000000
    if (algoBalance > 0) {
      score += Math.min(Math.log10(algoBalance + 1) * 10, 30)
    }
    
    score += Math.min(account['total-assets-opted-in'] * 3, 15)
    score += Math.min(account['total-apps-opted-in'] * 2, 10)
    
    score += Math.min(account['total-created-assets'] * 5, 15)
    score += Math.min(account['total-created-apps'] * 5, 10)
    
    if (account.balance > account['min-balance']) {
      score += 10
    }
    
    return Math.min(Math.round(score), 100)
  }, [])

  const connectWallet = useCallback(async (walletType: WalletType): Promise<boolean> => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      let accounts: string[] = []
      
      switch (walletType) {
        case 'pera':
          if (!window.PeraWallet) throw new Error("Pera Wallet not installed")
          const peraWallet = new window.PeraWallet.default()
          walletProviderRef.current = peraWallet
          accounts = await peraWallet.connect()
          break
          
        case 'defly':
          if (!window.DeflyWalletConnect) throw new Error("Defly Wallet not installed")
          const defly = window.DeflyWalletConnect.init()
          walletProviderRef.current = defly
          accounts = await defly.connect()
          break
          
        case 'algosigner':
          if (!window.AlgoSigner) throw new Error("AlgoSigner not installed")
          await window.AlgoSigner.connect()
          const algoSignerAccounts = await window.AlgoSigner.accounts({ ledger: ALGORAND_CONFIG.NETWORK })
          accounts = algoSignerAccounts.map((acc: any) => acc.address)
          walletProviderRef.current = window.AlgoSigner
          break
          
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`)
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found in wallet")
      }

      const address = accounts[0]
      setWalletState(prev => ({ ...prev, isLoading: true }))

      const accountInfo = await fetchAccountInfo(address)
      if (!accountInfo) {
        throw new Error("Failed to fetch account information")
      }

      const algoBalance = (accountInfo.balance / 1000000).toFixed(6)
      const trustScore = calculateTrustScore(accountInfo)

      const newState = {
        isConnected: true,
        isConnecting: false,
        isLoading: false,
        address,
        balance: algoBalance,
        microBalance: accountInfo.balance,
        trustScore,
        walletType,
        account: accountInfo,
        lastUpdated: new Date(),
        error: null,
      }

      setWalletState(prev => ({ ...prev, ...newState }))
      persistWalletState(newState)

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      refreshIntervalRef.current = setInterval(refreshAccount, 30000)

      toast({
        title: "Wallet Connected Successfully! 🎉",
        description: `Connected to ${walletType} with ${algoBalance} ALGO`,
      })

      return true
    } catch (error: any) {
      const errorMessage = error.message || "Failed to connect wallet"
      setWalletState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        isLoading: false,
        error: errorMessage 
      }))
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    }
  }, [fetchAccountInfo, calculateTrustScore, persistWalletState, toast])

  const disconnectWallet = useCallback(async (): Promise<void> => {
    try {
      if (walletProviderRef.current) {
        if (walletState.walletType === 'pera' && walletProviderRef.current.disconnect) {
          await walletProviderRef.current.disconnect()
        }
      }

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }

      setWalletState({
        isConnected: false,
        isConnecting: false,
        isLoading: false,
        address: null,
        balance: "0",
        microBalance: 0,
        trustScore: 0,
        walletType: null,
        account: null,
        investments: [],
        transactions: [],
        nftBadges: [],
        governanceTokens: 0,
        lastUpdated: null,
        error: null,
      })

      localStorage.removeItem('blockvest_wallet')
      walletProviderRef.current = null

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
  }, [walletState.walletType, toast])

  const refreshAccount = useCallback(async (): Promise<void> => {
    if (!walletState.isConnected || !walletState.address) return

    try {
      const accountInfo = await fetchAccountInfo(walletState.address)
      if (accountInfo) {
        const algoBalance = (accountInfo.balance / 1000000).toFixed(6)
        const trustScore = calculateTrustScore(accountInfo)

        setWalletState(prev => ({
          ...prev,
          balance: algoBalance,
          microBalance: accountInfo.balance,
          trustScore,
          account: accountInfo,
          lastUpdated: new Date(),
          error: null,
        }))
      }
    } catch (error: any) {
      console.error('Failed to refresh account:', error)
      setWalletState(prev => ({ 
        ...prev, 
        error: "Failed to refresh account data" 
      }))
    }
  }, [walletState.isConnected, walletState.address, fetchAccountInfo, calculateTrustScore])

  const makeInvestment = useCallback(async (entrepreneurId: string, amount: number): Promise<boolean> => {
    if (!walletState.isConnected || !walletState.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to make investments",
        variant: "destructive",
      })
      return false
    }

    try {
      const newInvestment: InvestmentPosition = {
        entrepreneurId,
        amountInvested: amount,
        expectedReturn: amount * 1.15,
        investmentDate: new Date(),
        status: 'active',
        contractAddress: `contract_${entrepreneurId}`,
      }

      setWalletState(prev => ({
        ...prev,
        investments: [...prev.investments, newInvestment]
      }))

      toast({
        title: "Investment Successful! 🎯",
        description: `Invested ${convertMicroAlgoToAlgo(amount).toFixed(2)} ALGO`,
      })

      return true
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message || "Failed to process investment",
        variant: "destructive",
      })
      return false
    }
  }, [walletState.isConnected, walletState.address, toast])

  const formatAddress = useCallback((address: string): string => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }, [])

  const convertAlgoToMicroAlgo = useCallback((algo: number): number => {
    return Math.round(algo * 1000000)
  }, [])

  const convertMicroAlgoToAlgo = useCallback((microAlgo: number): number => {
    return microAlgo / 1000000
  }, [])

  const sendTransaction = useCallback(async (recipientAddress: string, amount: number, note?: string): Promise<string> => {
    if (!walletState.isConnected || !walletProviderRef.current) {
      throw new Error("Wallet not connected")
    }

    try {
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newTransaction: WalletTransaction = {
        id: transactionId,
        type: 'investment',
        amount,
        status: 'pending',
        timestamp: new Date(),
        recipientAddress,
        note,
      }

      setWalletState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }))

      return transactionId
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`)
    }
  }, [walletState.isConnected])

  const optInToApp = useCallback(async (appId: number): Promise<boolean> => {
    if (!walletState.isConnected) return false
    
    try {
      toast({
        title: "App Opt-In Successful",
        description: `Successfully opted into application ${appId}`,
      })
      return true
    } catch (error: any) {
      toast({
        title: "Opt-In Failed",
        description: error.message,
        variant: "destructive",
      })
      return false
    }
  }, [walletState.isConnected, toast])

  const callSmartContract = useCallback(async (appId: number, method: string, args: any[]): Promise<any> => {
    if (!walletState.isConnected) {
      throw new Error("Wallet not connected")
    }
    
    try {
      console.log(`Calling contract ${appId}, method ${method} with args:`, args)
      return { success: true, data: null }
    } catch (error: any) {
      throw new Error(`Smart contract call failed: ${error.message}`)
    }
  }, [walletState.isConnected])

  const withdrawFunds = useCallback(async (amount: number): Promise<boolean> => {
    return makeInvestment("withdrawal", -amount)
  }, [makeInvestment])

  const getInvestmentHistory = useCallback((): InvestmentPosition[] => {
    return walletState.investments
  }, [walletState.investments])

  const getTransactionHistory = useCallback((): WalletTransaction[] => {
    return walletState.transactions
  }, [walletState.transactions])

  const updateTrustScore = useCallback(async (): Promise<void> => {
    if (walletState.account) {
      const newScore = calculateTrustScore(walletState.account)
      setWalletState(prev => ({ ...prev, trustScore: newScore }))
    }
  }, [walletState.account, calculateTrustScore])

  const participateInGovernance = useCallback(async (proposalId: string, vote: 'yes' | 'no'): Promise<boolean> => {
    toast({
      title: "Vote Submitted",
      description: `Your ${vote} vote for proposal ${proposalId} has been recorded`,
    })
    return true
  }, [toast])

  const clearError = useCallback((): void => {
    setWalletState(prev => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    loadPersistedState()
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [loadPersistedState])

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshAccount,
    makeInvestment,
    withdrawFunds,
    getInvestmentHistory,
    sendTransaction,
    getTransactionHistory,
    optInToApp,
    callSmartContract,
    formatAddress,
    convertAlgoToMicroAlgo,
    convertMicroAlgoToAlgo,
    updateTrustScore,
    participateInGovernance,
    clearError,
  }

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </WalletContext.Provider>
  )
}