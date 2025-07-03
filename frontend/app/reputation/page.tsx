"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Award, TrendingUp, Calendar } from "lucide-react"
import { motion } from "framer-motion"

const nftBadges = [
  {
    id: 1,
    name: "Early Adopter",
    description: "One of the first 1000 investors on the platform",
    image: "/placeholder.svg?height=150&width=150&query=early adopter badge",
    rarity: "Legendary",
    earned: "2024-01-15",
    benefits: ["5% bonus on all investments", "Priority access to new opportunities"],
  },
  {
    id: 2,
    name: "Impact Investor",
    description: "Invested in 10+ sustainable businesses",
    image: "/placeholder.svg?height=150&width=150&query=impact investor badge",
    rarity: "Epic",
    earned: "2024-03-22",
    benefits: ["Access to impact-only deals", "Quarterly impact reports"],
  },
  {
    id: 3,
    name: "Global Supporter",
    description: "Invested across 5+ different countries",
    image: "/placeholder.svg?height=150&width=150&query=global supporter badge",
    rarity: "Rare",
    earned: "2024-05-10",
    benefits: ["Regional investment insights", "Cultural exchange events"],
  },
  {
    id: 4,
    name: "Trust Builder",
    description: "Maintained 95+ trust score for 6 months",
    image: "/placeholder.svg?height=150&width=150&query=trust builder badge",
    rarity: "Epic",
    earned: "2024-07-18",
    benefits: ["Lower platform fees", "Enhanced profile visibility"],
  },
]

const trustMetrics = [
  { label: "Payment History", score: 98, weight: 30 },
  { label: "Investment Diversity", score: 85, weight: 20 },
  { label: "Community Engagement", score: 92, weight: 15 },
  { label: "Platform Activity", score: 88, weight: 15 },
  { label: "Verification Level", score: 100, weight: 20 },
]

const reputationHistory = [
  { date: "2024-01", score: 75, event: "Account Created" },
  { date: "2024-02", score: 78, event: "First Investment" },
  { date: "2024-03", score: 82, event: "KYC Verified" },
  { date: "2024-04", score: 85, event: "5 Investments Milestone" },
  { date: "2024-05", score: 88, event: "Global Supporter Badge" },
  { date: "2024-06", score: 90, event: "10 Investments Milestone" },
  { date: "2024-07", score: 93, event: "Trust Builder Badge" },
  { date: "2024-08", score: 95, event: "Perfect Payment Record" },
]

export default function ReputationPage() {
  const overallTrustScore = 95
  const nextMilestone = 100
  const progressToNext = ((overallTrustScore - 90) / (nextMilestone - 90)) * 100

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
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Reputation & NFT Badges</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your trust score and earned achievements on the Blockvest Social platform
          </p>
        </motion.div>

        {/* Trust Score Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-blockchain-green to-golden-yellow text-navy-dark">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Star className="w-12 h-12 text-navy-dark fill-current" />
                </div>
                <h2 className="font-heading text-4xl font-bold mb-2">{overallTrustScore}/100</h2>
                <p className="text-xl opacity-90 mb-4">Trust Score</p>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Elite (100)</span>
                    <span>{progressToNext.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressToNext} className="h-3 bg-navy-dark/20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark">Trust Score Breakdown</CardTitle>
              <CardDescription>How your trust score is calculated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trustMetrics.map((metric, index) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-navy-dark">{metric.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Weight: {metric.weight}%</span>
                        <Badge className="bg-blockchain-green/20 text-blockchain-green">{metric.score}/100</Badge>
                      </div>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* NFT Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark flex items-center">
                <Award className="w-6 h-6 mr-2 text-golden-yellow" />
                NFT Achievement Badges
              </CardTitle>
              <CardDescription>Unique digital badges earned through platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nftBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center space-y-3"
                  >
                    <div className="relative">
                      <img
                        src={badge.image || "/placeholder.svg"}
                        alt={badge.name}
                        className="w-32 h-32 mx-auto rounded-full border-4 border-golden-yellow shadow-lg"
                      />
                      <Badge
                        className={`absolute -top-2 -right-2 ${
                          badge.rarity === "Legendary"
                            ? "bg-purple-500"
                            : badge.rarity === "Epic"
                              ? "bg-golden-yellow text-navy-dark"
                              : "bg-blockchain-green"
                        }`}
                      >
                        {badge.rarity}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-dark">{badge.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Earned: {new Date(badge.earned).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-navy-dark">Benefits:</p>
                      {badge.benefits.map((benefit, i) => (
                        <p key={i} className="text-xs text-gray-600">
                          • {benefit}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reputation History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-blockchain-green" />
                Reputation History
              </CardTitle>
              <CardDescription>Your trust score progression over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reputationHistory.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blockchain-green/20 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blockchain-green">{entry.score}</span>
                      </div>
                      <div>
                        <p className="font-medium text-navy-dark">{entry.event}</p>
                        <p className="text-sm text-gray-500">{entry.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blockchain-green" />
                      <span className="text-sm font-medium text-blockchain-green">
                        +{index > 0 ? entry.score - reputationHistory[index - 1].score : entry.score}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
