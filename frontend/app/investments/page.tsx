"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, DollarSign, Target, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion } from "framer-motion"

const portfolioData = [
  { month: "Jan", value: 1000 },
  { month: "Feb", value: 1150 },
  { month: "Mar", value: 1080 },
  { month: "Apr", value: 1300 },
  { month: "May", value: 1450 },
  { month: "Jun", value: 1620 },
]

const investmentDistribution = [
  { name: "Agriculture", value: 45, color: "#00D395" },
  { name: "Technology", value: 30, color: "#FFB636" },
  { name: "Crafts", value: 15, color: "#1A1F36" },
  { name: "Retail", value: 10, color: "#6B7280" },
]

const activeInvestments = [
  {
    id: 1,
    entrepreneur: "Elena Rodriguez",
    business: "Organic Vegetable Farm",
    location: "Guatemala",
    invested: 250,
    currentValue: 287,
    roi: 14.8,
    status: "Active",
    duration: "8 months",
    nextPayment: "Dec 15, 2024",
    image: "/placeholder.svg?height=100&width=100&query=organic farm",
  },
  {
    id: 2,
    entrepreneur: "David Okonkwo",
    business: "Mobile Phone Repair",
    location: "Nigeria",
    invested: 150,
    currentValue: 178,
    roi: 18.7,
    status: "Active",
    duration: "6 months",
    nextPayment: "Dec 20, 2024",
    image: "/placeholder.svg?height=100&width=100&query=phone repair",
  },
  {
    id: 3,
    entrepreneur: "Fatima Al-Zahra",
    business: "Handicraft Cooperative",
    location: "Morocco",
    invested: 200,
    currentValue: 224,
    roi: 12.0,
    status: "Completed",
    duration: "12 months",
    nextPayment: "Completed",
    image: "/placeholder.svg?height=100&width=100&query=handicrafts",
  },
]

const stats = [
  {
    title: "Total Invested",
    value: "$2,450",
    change: "+$350",
    changeType: "positive",
    icon: DollarSign,
  },
  {
    title: "Current Value",
    value: "$2,891",
    change: "+18.0%",
    changeType: "positive",
    icon: TrendingUp,
  },
  {
    title: "Active Investments",
    value: "8",
    change: "+2",
    changeType: "positive",
    icon: Target,
  },
  {
    title: "Avg. ROI",
    value: "15.2%",
    change: "+2.1%",
    changeType: "positive",
    icon: ArrowUpRight,
  },
]

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen bg-navy-dark py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-heading text-4xl font-bold text-white mb-2">My Investment Portfolio</h1>
          <p className="text-gray-300">Track your investments and monitor returns across your portfolio</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-light-bg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="w-8 h-8 text-blockchain-green" />
                      <div
                        className={`flex items-center text-sm ${
                          stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.changeType === "positive" ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-navy-dark mb-1">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.title}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Portfolio Performance */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Card className="bg-light-bg">
              <CardHeader>
                <CardTitle className="text-navy-dark">Portfolio Performance</CardTitle>
                <CardDescription>Your investment value over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={portfolioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Portfolio Value"]}
                      labelStyle={{ color: "#1A1F36" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00D395"
                      strokeWidth={3}
                      dot={{ fill: "#00D395", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Investment Distribution */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <Card className="bg-light-bg">
              <CardHeader>
                <CardTitle className="text-navy-dark">Investment Distribution</CardTitle>
                <CardDescription>Breakdown by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={investmentDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {investmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Investments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark">Active Investments</CardTitle>
              <CardDescription>Detailed view of your current investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {activeInvestments.map((investment, index) => (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={investment.image || "/placeholder.svg"}
                          alt={investment.business}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-navy-dark text-lg">{investment.entrepreneur}</h3>
                          <p className="text-gray-600">{investment.business}</p>
                          <p className="text-sm text-gray-500">{investment.location}</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          investment.status === "Active"
                            ? "bg-blockchain-green/20 text-blockchain-green"
                            : "bg-golden-yellow/20 text-golden-yellow"
                        }
                      >
                        {investment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Invested</div>
                        <div className="font-semibold text-navy-dark">${investment.invested}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Current Value</div>
                        <div className="font-semibold text-blockchain-green">${investment.currentValue}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">ROI</div>
                        <div className="font-semibold text-golden-yellow">+{investment.roi}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-semibold text-navy-dark">{investment.duration}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-sm">Next payment: {investment.nextPayment}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blockchain-green text-blockchain-green hover:bg-blockchain-green hover:text-white"
                      >
                        View Details
                      </Button>
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
