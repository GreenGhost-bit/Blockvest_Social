"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ConnectWallet } from "@/components/connect-wallet"
import { Home, Search, TrendingUp, Award, ShoppingCart, Vote, HelpCircle, Menu, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore Businesses", href: "/explore", icon: Search },
  { name: "My Investments", href: "/investments", icon: TrendingUp },
  { name: "Reputation & NFTs", href: "/reputation", icon: Award },
  { name: "Impact Marketplace", href: "/marketplace", icon: ShoppingCart },
  { name: "Governance", href: "/governance", icon: Vote },
  { name: "About/FAQ", href: "/about", icon: HelpCircle },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/95 backdrop-blur-sm border-b border-blockchain-green/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blockchain-green to-golden-yellow rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-navy-dark" />
            </div>
            <span className="font-heading font-bold text-xl text-white">Blockvest Social</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blockchain-green/20 text-blockchain-green"
                      : "text-gray-300 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Connect Wallet & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <ConnectWallet />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-navy-dark border-blockchain-green/20">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-blockchain-green/20 text-blockchain-green"
                            : "text-gray-300 hover:text-white hover:bg-white/10",
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
