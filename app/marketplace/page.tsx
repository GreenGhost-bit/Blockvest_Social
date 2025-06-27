"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShoppingCart, Star, MapPin, Coins, CreditCard, Wallet } from "lucide-react"
import { motion } from "framer-motion"

const products = [
  {
    id: 1,
    name: "Organic Coffee Beans",
    seller: "Carlos Mendoza",
    location: "Peru",
    price: 0.025,
    priceUSD: 45,
    category: "Food & Beverages",
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=200&width=200&query=organic coffee beans",
    description: "Premium organic coffee beans grown at high altitude with sustainable farming practices.",
    inStock: true,
    cryptoOnly: true,
  },
  {
    id: 2,
    name: "Handwoven Moroccan Rug",
    seller: "Fatima Al-Zahra",
    location: "Morocco",
    price: 0.15,
    priceUSD: 270,
    category: "Handicrafts",
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=200&width=200&query=moroccan rug",
    description: "Beautiful handwoven rug made by local artisans using traditional techniques.",
    inStock: true,
    cryptoOnly: false,
  },
  {
    id: 3,
    name: "Solar Power Bank",
    seller: "Ahmed Hassan",
    location: "Egypt",
    price: 0.035,
    priceUSD: 63,
    category: "Technology",
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=200&width=200&query=solar power bank",
    description: "Portable solar power bank perfect for off-grid charging needs.",
    inStock: true,
    cryptoOnly: true,
  },
  {
    id: 4,
    name: "Organic Vegetables Box",
    seller: "Elena Rodriguez",
    location: "Guatemala",
    price: 0.018,
    priceUSD: 32,
    category: "Food & Beverages",
    rating: 4.6,
    reviews: 203,
    image: "/placeholder.svg?height=200&width=200&query=organic vegetables",
    description: "Fresh organic vegetables harvested from sustainable farms.",
    inStock: false,
    cryptoOnly: false,
  },
]

const earnings = [
  { source: "Elena Rodriguez - Organic Farm", amount: 0.012, amountUSD: 21.6, date: "2024-11-15" },
  { source: "David Okonkwo - Phone Repair", amount: 0.008, amountUSD: 14.4, date: "2024-11-10" },
  { source: "Fatima Al-Zahra - Handicrafts", amount: 0.015, amountUSD: 27.0, date: "2024-11-05" },
]

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<(typeof products)[0] | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("crypto")

  const filteredProducts = products.filter(
    (product) => selectedCategory === "all" || product.category.toLowerCase().includes(selectedCategory.toLowerCase()),
  )

  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
  const totalEarningsUSD = earnings.reduce((sum, earning) => sum + earning.amountUSD, 0)

  return (
    <div className="min-h-screen bg-navy-dark py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Impact Marketplace</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Shop products from entrepreneurs you've invested in and redeem your earnings for goods
          </p>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blockchain-green to-golden-yellow text-navy-dark">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">{totalEarnings.toFixed(3)} ETH</div>
                  <div className="text-sm opacity-90">Available Earnings</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">${totalEarningsUSD.toFixed(2)}</div>
                  <div className="text-sm opacity-90">USD Equivalent</div>
                </div>
                <div className="text-center">
                  <Button className="bg-navy-dark hover:bg-navy-dark/90 text-white">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Redeem Earnings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="bg-light-bg mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="Search products..." className="border-gray-300" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food & Beverages</SelectItem>
                  <SelectItem value="handicrafts">Handicrafts</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blockchain-green hover:bg-blockchain-green/90 text-white">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-light-bg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="aspect-square bg-gray-200 relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {product.cryptoOnly && (
                      <Badge className="bg-blockchain-green text-white">
                        <Coins className="w-3 h-3 mr-1" />
                        Crypto Only
                      </Badge>
                    )}
                    {!product.inStock && <Badge variant="destructive">Out of Stock</Badge>}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-navy-dark">{product.name}</CardTitle>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-golden-yellow fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-navy-dark/70">by {product.seller}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{product.location}</span>
                    </div>
                    <span className="text-xs text-gray-500">{product.reviews} reviews</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-lg font-bold text-blockchain-green">{product.price} ETH</div>
                      <div className="text-sm text-gray-500">≈ ${product.priceUSD}</div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-golden-yellow hover:bg-golden-yellow/90 text-navy-dark"
                          disabled={!product.inStock}
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.inStock ? "Buy Now" : "Out of Stock"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-light-bg">
                        <DialogHeader>
                          <DialogTitle className="text-navy-dark">Purchase {selectedProduct?.name}</DialogTitle>
                          <DialogDescription className="text-navy-dark/70">
                            Complete your purchase using crypto or earnings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-navy-dark">Price</label>
                              <div className="mt-1 p-2 bg-gray-100 rounded text-sm text-navy-dark">
                                {selectedProduct?.price} ETH (${selectedProduct?.priceUSD})
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-navy-dark">Quantity</label>
                              <Input type="number" defaultValue="1" className="mt-1" />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-navy-dark">Payment Method</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="crypto">
                                  <div className="flex items-center">
                                    <Wallet className="w-4 h-4 mr-2" />
                                    Wallet Balance
                                  </div>
                                </SelectItem>
                                <SelectItem value="earnings">
                                  <div className="flex items-center">
                                    <Coins className="w-4 h-4 mr-2" />
                                    Investment Earnings
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button className="w-full bg-blockchain-green hover:bg-blockchain-green/90 text-white">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Complete Purchase
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark">Recent Earnings Available for Redemption</CardTitle>
              <CardDescription>Your latest investment returns ready to be spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earnings.map((earning, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-navy-dark">{earning.source}</p>
                      <p className="text-sm text-gray-500">{earning.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blockchain-green">{earning.amount} ETH</div>
                      <div className="text-sm text-gray-500">${earning.amountUSD}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
