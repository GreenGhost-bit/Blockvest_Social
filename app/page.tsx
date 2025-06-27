"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Users, DollarSign, Globe, Star, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

const stats = [
  { label: "Total Investments", value: "$2.4M", icon: DollarSign, change: "+12%" },
  { label: "Active Entrepreneurs", value: "1,247", icon: Users, change: "+8%" },
  { label: "Success Rate", value: "94%", icon: TrendingUp, change: "+2%" },
  { label: "Global Reach", value: "45", icon: Globe, change: "+5%" },
]

const successStories = [
  {
    id: 1,
    name: "Maria Santos",
    business: "Sustainable Coffee Farm",
    location: "Colombia",
    funded: "$15,000",
    roi: "127%",
    image: "/placeholder.svg?height=200&width=300&query=coffee farm",
    trustScore: 95,
    description: "Transformed local coffee production with eco-friendly practices",
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    business: "Solar Panel Installation",
    location: "Egypt",
    funded: "$8,500",
    roi: "89%",
    image: "/placeholder.svg?height=200&width=300&query=solar panels",
    trustScore: 92,
    description: "Bringing renewable energy to rural communities",
  },
  {
    id: 3,
    name: "Priya Sharma",
    business: "Textile Cooperative",
    location: "India",
    funded: "$12,000",
    roi: "156%",
    image: "/placeholder.svg?height=200&width=300&query=textile workshop",
    trustScore: 98,
    description: "Empowering women through traditional craft modernization",
  },
]

export default function HomePage() {
  const [animatedStats, setAnimatedStats] = useState(stats.map((stat) => ({ ...stat, animatedValue: "0" })))

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats(stats.map((stat) => ({ ...stat, animatedValue: stat.value })))
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/10 to-golden-yellow/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blockchain-green to-golden-yellow bg-clip-text text-transparent">
              Invest in Tomorrow's Entrepreneurs
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Empower global entrepreneurs through blockchain-powered micro-investments. Build wealth while creating
              positive impact across emerging markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-golden-yellow hover:bg-golden-yellow/90 text-navy-dark font-semibold text-lg px-8 py-4"
                asChild
              >
                <Link href="/explore">
                  Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-blockchain-green text-blockchain-green hover:bg-blockchain-green hover:text-navy-dark font-semibold text-lg px-8 py-4"
              >
                Become an Entrepreneur
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Stats */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {animatedStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-light-bg text-navy-dark hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-blockchain-green" />
                        <Badge className="bg-blockchain-green/20 text-blockchain-green">{stat.change}</Badge>
                      </div>
                      <div className="text-3xl font-bold font-heading mb-2">{stat.animatedValue}</div>
                      <div className="text-gray-600 font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold text-white mb-4">Success Stories</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real entrepreneurs, real impact. See how micro-investments are changing lives around the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card className="bg-light-bg text-navy-dark overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={story.image || "/placeholder.svg"}
                      alt={story.business}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 right-4 bg-blockchain-green text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {story.trustScore}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{story.name}</CardTitle>
                      <Badge variant="outline" className="text-blockchain-green border-blockchain-green">
                        {story.location}
                      </Badge>
                    </div>
                    <CardDescription className="text-navy-dark/70">{story.business}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{story.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Funded</div>
                        <div className="font-semibold text-blockchain-green">{story.funded}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">ROI</div>
                        <div className="font-semibold text-golden-yellow">{story.roi}</div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-blockchain-green" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-blockchain-green to-golden-yellow text-navy-dark">
            <CardContent className="p-12 text-center">
              <h2 className="font-heading text-4xl font-bold mb-4">Ready to Make an Impact?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of investors creating positive change through micro-investments
              </p>
              <Button
                size="lg"
                className="bg-navy-dark hover:bg-navy-dark/90 text-white font-semibold text-lg px-8 py-4"
                asChild
              >
                <Link href="/explore">
                  Explore Opportunities <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
