"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// components/wallet-provider.tsx
"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { PeraWalletConnect } from '@perawallet/connect'
import algosdk from 'algosdk'
import { useToast } from '@/hooks/use-toast'

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: number
  loading: boolean
  error: string | null
  accounts: string[]
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signTransaction: (txn: algosdk.Transaction) => Promise<Uint8Array>
  refreshBalance: () => Promise<void>
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  balance: 0,
  loading: false,
  error: null,
  accounts: [],
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

let peraWallet: PeraWalletConnect

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONNECTED'; payload: { address: string; balance: number; accounts: string[] } }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'UPDATE_BALANCE'; payload: number }

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null }
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        address: action.payload.address,
        balance: action.payload.balance,
        accounts: action.payload.accounts,
        loading: false,
        error: null,
      }
    case 'SET_DISCONNECTED':
      return { ...initialState }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'UPDATE_BALANCE':
      return { ...state, balance: action.payload }
    default:
      return state
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)
  const { toast } = useToast()

  const algodClient = new algosdk.Algodv2(
    '',
    'https://testnet-api.algonode.cloud',
    ''
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      peraWallet = new PeraWalletConnect({
        shouldShowSignTxnToast: false,
      })

      peraWallet.reconnectSession().then((accounts) => {
        if (accounts.length) {
          connectToAccount(accounts[0], accounts)
        }
      }).catch((error) => {
        console.error('Failed to reconnect:', error)
      })

      peraWallet.connector?.on('disconnect', () => {
        dispatch({ type: 'SET_DISCONNECTED' })
        toast({
          title: "Wallet Disconnected",
          description: "Your wallet has been disconnected.",
        })
      })
    }
  }, [])

  const connectToAccount = async (address: string, accounts: string[] = [address]) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const accountInfo = await algodClient.accountInformation(address).do()
      dispatch({
        type: 'SET_CONNECTED',
        payload: {
          address,
          balance: accountInfo.amount / 1000000,
          accounts,
        },
      })
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      console.error('Failed to connect to account:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to account' })
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet account.",
        variant: "destructive",
      })
    }
  }

  const connectWallet = async () => {
    if (!peraWallet) {
      dispatch({ type: 'SET_ERROR', payload: 'Wallet not initialized' })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const accounts = await peraWallet.connect()
      if (accounts.length) {
        await connectToAccount(accounts[0], accounts)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect wallet' })
      toast({
        title: "Connection Failed",
        description: "Failed to connect your wallet. Please try again.",
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    if (peraWallet) {
      peraWallet.disconnect()
    }
    dispatch({ type: 'SET_DISCONNECTED' })
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
  }

  const refreshBalance = async () => {
    if (state.address) {
      try {
        const accountInfo = await algodClient.accountInformation(state.address).do()
        dispatch({ type: 'UPDATE_BALANCE', payload: accountInfo.amount / 1000000 })
      } catch (error) {
        console.error('Failed to refresh balance:', error)
      }
    }
  }

  const signTransaction = async (txn: algosdk.Transaction): Promise<Uint8Array> => {
    if (!peraWallet || !state.address) {
      throw new Error('Wallet not connected')
    }

    try {
      const signedTxn = await peraWallet.signTransaction([{ txn }])
      return signedTxn[0]
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connectWallet,
        disconnectWallet,
        signTransaction,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
