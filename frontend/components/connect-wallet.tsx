"use client"

import { useState } from "react"
import { Button } from "@/frontend/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Wallet, ExternalLink, Shield, Zap, Globe } from "lucide-react"
import { useWallet } from "./wallet-provider"
import { motion, AnimatePresence } from "framer-motion"
import { truncateAddress, formatCurrency } from "@/frontend/lib/utils"

const walletFeatures = [
  {
    icon: Shield,
    title: "Secure",
    description: "Military-grade encryption"
  },
  {
    icon: Zap,
    title: "Fast",
    description: "Instant transactions"
  },
  {
    icon: Globe,
    title: "Global",
    description: "Worldwide access"
  }
]

export function ConnectWallet() {
  const { isConnected, address, balance, loading, connectWallet, disconnectWallet } = useWallet()
  const [showDetails, setShowDetails] = useState(false)

  if (isConnected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <Card className="bg-gradient-to-br from-blockchain-green/10 to-golden-yellow/10 border-blockchain-green/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blockchain-green/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-blockchain-green" />
                </div>
                <div>
                  <CardTitle className="text-lg">Wallet Connected</CardTitle>
                  <CardDescription className="text-sm">
                    {truncateAddress(address)}
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30">
                Connected
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <span className="text-sm text-gray-400">Balance</span>
                <span className="font-bold text-lg text-blockchain-green">
                  {balance.toFixed(4)} ALGO
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                  className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                >
                  Disconnect
                </Button>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 pt-2 border-t border-white/10"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network</span>
                      <span>Algorand Testnet</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Address</span>
                      <span className="font-mono">{truncateAddress(address)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">USD Value</span>
                      <span>{formatCurrency(balance * 0.15)}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-blockchain-green/20 rounded-full w-fit">
            <Wallet className="w-8 h-8 text-blockchain-green" />
          </div>
          <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
          <CardDescription className="text-gray-300">
            Connect your Algorand wallet to start investing in entrepreneurs worldwide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {walletFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <Icon className="w-6 h-6 text-blockchain-green mx-auto mb-2" />
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>

          <Button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blockchain-green to-emerald-500 hover:from-emerald-500 hover:to-blockchain-green text-white font-bold py-3 text-lg"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Connect Pera Wallet</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              Don't have a wallet?{" "}
              <a 
                href="https://perawallet.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blockchain-green hover:underline"
              >
                Download Pera Wallet
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}