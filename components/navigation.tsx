"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  TrendingUp, 
  Vote, 
  Building2, 
  ShoppingCart,
  Bell,
  User,
  Settings,
  LogOut,
  Wallet
} from "lucide-react"
import { useWallet } from "./wallet-provider"
import { ConnectWallet } from "./connect-wallet"
import { motion, AnimatePresence } from "framer-motion"
import { cn, truncateAddress } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
  { name: "Investments", href: "/investments", icon: TrendingUp },
  { name: "Governance", href: "/governance", icon: Vote },
  { name: "About", href: "/about", icon: Building2 },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingCart },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { isConnected, address, balance } = useWallet()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled 
            ? "bg-navy-dark/95 backdrop-blur-md border-b border-white/10 shadow-lg" 
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blockchain-green to-golden-yellow rounded-lg flex items-center justify-center">
                  <span className="text-navy-dark font-bold text-lg">BV</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold font-heading text-white">
                    BlockVest
                  </h1>
                  <p className="text-xs text-gray-400 -mt-1">Social</p>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-blockchain-green/20 text-blockchain-green"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 rounded-lg">
                    <Wallet className="w-4 h-4 text-blockchain-green" />
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {truncateAddress(address || '')}
                      </div>
                      <div className="text-xs text-blockchain-green">
                        {balance.toFixed(2)} ALGO
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowWalletModal(true)}
                  className="bg-gradient-to-r from-blockchain-green to-emerald-500 hover:from-emerald-500 hover:to-blockchain-green text-white font-semibold"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="lg:hidden text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-navy-dark/95 backdrop-blur-md border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href} onClick={closeMenu}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                          isActive
                            ? "bg-blockchain-green/20 text-blockchain-green"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  )
                })}
                
                <div className="pt-4 border-t border-white/10">
                  {isConnected ? (
                    <div className="space-y-3">
                      <div className="px-4 py-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Wallet className="w-5 h-5 text-blockchain-green" />
                          <div>
                            <div className="text-sm font-medium text-white">
                              {truncateAddress(address || '')}
                            </div>
                            <div className="text-xs text-blockchain-green">
                              {balance.toFixed(4)} ALGO
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowWalletModal(true)
                        closeMenu()
                      }}
                      className="w-full bg-gradient-to-r from-blockchain-green to-emerald-500 text-white font-semibold"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Wallet Modal */}
      <AnimatePresence>
        {showWalletModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowWalletModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWalletModal(false)}
                  className="absolute -top-2 -right-2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <ConnectWallet />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}