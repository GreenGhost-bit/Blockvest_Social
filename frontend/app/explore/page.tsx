"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  Globe,
  DollarSign,
  Target,
  Calendar,
  Award,
  CheckCircle,
  ArrowRight,
  Heart,
  Bookmark
} from "lucide-react"
import { formatCurrency } from "@/frontend/lib/utils"

const categories = [
  "All",
  "Agriculture", 
  "Technology",
  "Healthcare",
  "Education",
  "Clean Energy",
  "Manufacturing",
  "Retail",
  "Services"
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "funding", label: "Funding Goal" },
  { value: "progress", label: "Progress" },
  { value: "rating", label: "Rating" },
]

const opportunities = [
  {
    id: 1,
    title: "Solar Panel Manufacturing",
    entrepreneur: "Ahmed Hassan",
    location: "Cairo, Egypt",
    category: "Clean Energy",
    description: "Establishing a solar panel manufacturing facility to serve the growing renewable energy market in North Africa.",
    fundingGoal: 25000,
    currentFunding: 18750,
    daysLeft: 23,
    minInvestment: 100,
    investors: 127,
    rating: 4.8,
    riskLevel: "Medium",
    expectedROI: "18-25%",
    timeline: "24 months",
    verified: true,
    featured: true,
    image: "/placeholder.svg?height=200&width=400&query=solar panels",
    highlights: [
      "Government renewable energy incentives",
      "Existing partnerships with local distributors",
      "Experienced technical team"
    ]
  },
  {
    id: 2,
    title: "Organic Spice Cooperative",
    entrepreneur: "Priya Sharma",
    location: "Kerala, India",
    category: "Agriculture",
    description: "Building a cooperative network of organic spice farmers to export premium spices to international markets.",
    fundingGoal: 12000,
    currentFunding: 8940,
    daysLeft: 31,
    minInvestment: 50,
    investors: 89,
    rating: 4.9,
    riskLevel: "Low",
    expectedROI: "15-22%",
    timeline: "18 months",
    verified: true,
    featured: false,
    image: "/placeholder.svg?height=200&width=400&query=spice farm",
    highlights: [
      "Organic certification in progress",
      "Direct relationships with international buyers",
      "Sustainable farming practices"
    ]
  },
  {
    id: 3,
    title: "Mobile Health Clinic",
    entrepreneur: "Dr. Maria Santos",
    location: "São Paulo, Brazil",
    category: "Healthcare",
    description: "Mobile clinic providing healthcare services to underserved communities in metropolitan areas.",
    fundingGoal: 35000,
    currentFunding: 22750,
    daysLeft: 19,
    minInvestment: 200,
    investors: 156,
    rating: 4.7,
    riskLevel: "Medium",
    expectedROI: "12-18%",
    timeline: "30 months",
    verified: true,
    featured: true,
    image: "/placeholder.svg?height=200&width=400&query=mobile clinic",
    highlights: [
      "Government healthcare partnership",
      "Medical team already assembled",
      "Insurance coverage negotiations underway"
    ]
  },
  {
    id: 4,
    title: "Digital Learning Platform",
    entrepreneur: "James Okonkwo",
    location: "Lagos, Nigeria",
    category: "Education",
    description: "E-learning platform focused on technical skills training for young professionals in emerging markets.",
    fundingGoal: 18000,
    currentFunding: 11340,
    daysLeft: 27,
    minInvestment: 75,
    investors: 94,
    rating: 4.6,
    riskLevel: "High",
    expectedROI: "25-35%",
    timeline: "15 months",
    verified: true,
    featured: false,
    image: "/placeholder.svg?height=200&width=400&query=online learning",
    highlights: [
      "Beta platform already live",
      "Partnerships with local universities",
      "Growing user base of 2,000+ students"
    ]
  },
  {
    id: 5,
    title: "Sustainable Coffee Farm",
    entrepreneur: "Carlos Rodriguez",
    location: "Medellín, Colombia",
    category: "Agriculture",
    description: "Expanding sustainable coffee production with focus on fair trade and environmental conservation.",
    fundingGoal: 22000,
    currentFunding: 15840,
    daysLeft: 35,
    minInvestment: 100,
    investors: 112,
    rating: 4.8,
    riskLevel: "Low",
    expectedROI: "16-23%",
    timeline: "20 months",
    verified: true,
    featured: true,
    image: "/placeholder.svg?height=200&width=400&query=coffee farm",
    highlights: [
      "Fair trade certification",
      "Direct relationships with international roasters",
      "Award-winning coffee varieties"
    ]
  },
  {
    id: 6,
    title: "Textile Manufacturing Hub",
    entrepreneur: "Fatima Al-Zahra",
    location: "Casablanca, Morocco",
    category: "Manufacturing",
    description: "Modern textile manufacturing facility producing sustainable fabrics for European fashion brands.",
    fundingGoal: 45000,
    currentFunding: 31500,
    daysLeft: 14,
    minInvestment: 250,
    investors: 198,
    rating: 4.9,
    riskLevel: "Medium",
    expectedROI: "20-28%",
    timeline: "36 months",
    verified: true,
    featured: true,
    image: "/placeholder.svg?height=200&width=400&query=textile factory",
    highlights: [
      "Contracts with major European brands",
      "Eco-friendly production processes",
      "Skilled workforce training program"
    ]
  }
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [filteredOpportunities, setFilteredOpportunities] = useState(opportunities)
  const [savedOpportunities, setSavedOpportunities] = useState<number[]>([])

  useEffect(() => {
    let filtered = opportunities.filter(opportunity => {
      const matchesSearch = opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opportunity.entrepreneur.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          opportunity.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || opportunity.category === selectedCategory
      return matchesSearch && matchesCategory
    })

    // Sort opportunities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "funding":
          return b.fundingGoal - a.fundingGoal
        case "progress":
          return (b.currentFunding / b.fundingGoal) - (a.currentFunding / a.fundingGoal)
        case "rating":
          return b.rating - a.rating
        default:
          return b.id - a.id // newest first
      }
    })

    setFilteredOpportunities(filtered)
  }, [searchQuery, selectedCategory, sortBy])

  const toggleSaved = (id: number) => {
    setSavedOpportunities(prev => 
      prev.includes(id) 
        ? prev.filter(opId => opId !== id)
        : [...prev, id]
    )
  }

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low": return "text-green-400 bg-green-400/20 border-green-400/30"
      case "Medium": return "text-yellow-400 bg-yellow-400/20 border-yellow-400/30"
      case "High": return "text-red-400 bg-red-400/20 border-red-400/30"
      default: return "text-gray-400 bg-gray-400/20 border-gray-400/30"
    }
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-br from-blockchain-green/10 via-transparent to-golden-yellow/10">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Investment <span className="text-blockchain-green">Opportunities</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover verified entrepreneurs around the world seeking funding for their innovative business ventures
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search entrepreneurs, locations, or business types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-green focus:border-transparent backdrop-blur-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className={
                    selectedCategory === category
                      ? "bg-blockchain-green hover:bg-blockchain-green/90 text-white"
                      : "border-white/20 text-gray-300 hover:bg-white/10"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blockchain-green"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-navy-dark">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-400">
                {filteredOpportunities.length} opportunities found
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Opportunities Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOpportunities.map((opportunity, index) => (
                <motion.div
                  key={opportunity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  layout
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 overflow-hidden hover:scale-105 transition-all duration-300 group relative">
                    {opportunity.featured && (
                      <Badge className="absolute top-4 left-4 z-10 bg-golden-yellow text-navy-dark font-semibold">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                    
                    <button
                      onClick={() => toggleSaved(opportunity.id)}
                      className="absolute top-4 right-4 z-10 p-2 bg-black/20 backdrop-blur-sm rounded-full hover:bg-black/40 transition-colors"
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${savedOpportunities.includes(opportunity.id) ? 'text-golden-yellow fill-current' : 'text-white'}`} 
                      />
                    </button>

                    {/* Image */}
                    <div className="aspect-[4/3] bg-gray-700 relative overflow-hidden">
                      <img
                        src={opportunity.image}
                        alt={opportunity.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Risk Level */}
                      <Badge className={`absolute bottom-4 left-4 ${getRiskColor(opportunity.riskLevel)}`}>
                        {opportunity.riskLevel} Risk
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-blockchain-green border-blockchain-green/30">
                          {opportunity.category}
                        </Badge>
                        {opportunity.verified && (
                          <CheckCircle className="w-5 h-5 text-blockchain-green" />
                        )}
                      </div>
                      
                      <CardTitle className="text-lg font-bold text-white line-clamp-2">
                        {opportunity.title}
                      </CardTitle>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{opportunity.entrepreneur}</span>
                        <span>•</span>
                        <MapPin className="w-4 h-4" />
                        <span>{opportunity.location}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <CardDescription className="text-gray-300 line-clamp-3">
                        {opportunity.description}
                      </CardDescription>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-blockchain-green font-semibold">
                            {Math.round(getProgressPercentage(opportunity.currentFunding, opportunity.fundingGoal))}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blockchain-green to-emerald-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getProgressPercentage(opportunity.currentFunding, opportunity.fundingGoal)}%` }}
                          />
                        </div