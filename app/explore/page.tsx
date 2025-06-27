"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, MapPin, Clock, Shield, DollarSign } from "lucide-react"
import { motion } from "framer-motion"

const businesses = [
  {
    id: 1,
    name: "Elena Rodriguez",
    business: "Organic Vegetable Farm",
    location: "Guatemala",
    category: "Agriculture",
    fundingGoal: 10000,
    fundingRaised: 7500,
    trustScore: 94,
    timeLeft: "12 days",
    minInvestment: 25,
    expectedROI: "15-20%",
    description:
      "Expanding organic vegetable production to supply local markets and restaurants with sustainable, pesticide-free produce.",
    image: "/placeholder.svg?height=200&width=300&query=organic farm",
    verified: true,
    riskLevel: "Low",
  },
  {
    id: 2,
    name: "David Okonkwo",
    business: "Mobile Phone Repair Shop",
    location: "Nigeria",
    category: "Technology",
    fundingGoal: 5000,
    fundingRaised: 3200,
    trustScore: 89,
    timeLeft: "8 days",
    minInvestment: 15,
    expectedROI: "18-25%",
    description:
      "Establishing a mobile phone repair service in an underserved urban area with high demand for affordable tech services.",
    image: "/placeholder.svg?height=200&width=300&query=phone repair shop",
    verified: true,
    riskLevel: "Medium",
  },
  {
    id: 3,
    name: "Fatima Al-Zahra",
    business: "Handicraft Cooperative",
    location: "Morocco",
    category: "Crafts",
    fundingGoal: 8000,
    fundingRaised: 6400,
    trustScore: 96,
    timeLeft: "5 days",
    minInvestment: 20,
    expectedROI: "12-18%",
    description:
      "Supporting local artisans by creating a cooperative that produces and exports traditional Moroccan handicrafts.",
    image: "/placeholder.svg?height=200&width=300&query=moroccan handicrafts",
    verified: true,
    riskLevel: "Low",
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    business: "Coffee Processing Plant",
    location: "Peru",
    category: "Agriculture",
    fundingGoal: 15000,
    fundingRaised: 4500,
    trustScore: 87,
    timeLeft: "18 days",
    minInvestment: 50,
    expectedROI: "20-28%",
    description:
      "Building a small-scale coffee processing facility to add value to locally grown coffee beans before export.",
    image: "/placeholder.svg?height=200&width=300&query=coffee processing",
    verified: true,
    riskLevel: "Medium",
  },
]

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedBusiness, setSelectedBusiness] = useState<(typeof businesses)[0] | null>(null)

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.business.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || business.category.toLowerCase() === selectedCategory
    const matchesRegion =
      selectedRegion === "all" || business.location.toLowerCase().includes(selectedRegion.toLowerCase())

    return matchesSearch && matchesCategory && matchesRegion
  })

  const handleInvest = (business: (typeof businesses)[0]) => {
    setSelectedBusiness(business)
  }

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
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Investment Opportunities
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover verified entrepreneurs from around the world seeking micro-investments to grow their businesses.
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="bg-light-bg mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="agriculture">Agriculture</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="crafts">Crafts</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="latin">Latin America</SelectItem>
                  <SelectItem value="africa">Africa</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="middle">Middle East</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blockchain-green hover:bg-blockchain-green/90 text-white">Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business, index) => {
            const fundingPercentage = (business.fundingRaised / business.fundingGoal) * 100

            return (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-light-bg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={business.image || "/placeholder.svg"}
                      alt={business.business}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {business.verified && (
                        <Badge className="bg-blockchain-green text-white">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`
                        ${
                          business.riskLevel === "Low"
                            ? "border-green-500 text-green-600"
                            : business.riskLevel === "Medium"
                              ? "border-yellow-500 text-yellow-600"
                              : "border-red-500 text-red-600"
                        }
                      `}
                      >
                        {business.riskLevel} Risk
                      </Badge>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-golden-yellow text-navy-dark">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {business.trustScore}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-navy-dark">{business.name}</CardTitle>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{business.location}</span>
                      </div>
                    </div>
                    <CardDescription className="text-navy-dark/70">{business.business}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Funding Progress</span>
                        <span className="font-medium text-navy-dark">
                          ${business.fundingRaised.toLocaleString()} / ${business.fundingGoal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={fundingPercentage} className="h-2" />
                      <div className="text-xs text-gray-500 text-right">{fundingPercentage.toFixed(1)}% funded</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Min. Investment</div>
                        <div className="font-semibold text-blockchain-green">${business.minInvestment}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Expected ROI</div>
                        <div className="font-semibold text-golden-yellow">{business.expectedROI}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">{business.timeLeft} left</span>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="bg-golden-yellow hover:bg-golden-yellow/90 text-navy-dark"
                            onClick={() => setSelectedBusiness(business)}
                          >
                            Invest Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-light-bg">
                          <DialogHeader>
                            <DialogTitle className="text-navy-dark">Invest in {selectedBusiness?.business}</DialogTitle>
                            <DialogDescription className="text-navy-dark/70">
                              Support {selectedBusiness?.name} in {selectedBusiness?.location}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-navy-dark">Investment Amount</label>
                                <Input
                                  type="number"
                                  placeholder={`Min. $${selectedBusiness?.minInvestment}`}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-navy-dark">Expected Return</label>
                                <div className="mt-1 p-2 bg-gray-100 rounded text-sm text-navy-dark">
                                  {selectedBusiness?.expectedROI}
                                </div>
                              </div>
                            </div>
                            <Button className="w-full bg-blockchain-green hover:bg-blockchain-green/90 text-white">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Confirm Investment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
