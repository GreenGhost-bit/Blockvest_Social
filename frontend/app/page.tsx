"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/frontend/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { ArrowRight, TrendingUp, Users, DollarSign, Globe, Star, CheckCircle, Shield, Clock, Award } from "lucide-react"
import Link from "next/link"
import { motion, useInView, useSpring, useTransform } from "framer-motion"

const stats = [
  { label: "Total Investments", value: "$2.4M", icon: DollarSign, change: "+12%", description: "Deployed capital" },
  { label: "Active Entrepreneurs", value: "1,247", icon: Users, change: "+8%", description: "Verified businesses" },
  { label: "Success Rate", value: "94%", icon: TrendingUp, change: "+2%", description: "Profitable ventures" },
  { label: "Global Reach", value: "45", icon: Globe, change: "+5%", description: "Countries served" },
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
    description: "Transformed local coffee production with eco-friendly practices, creating 20+ jobs",
    timeline: "18 months",
    category: "Agriculture",
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
    description: "Bringing renewable energy to rural communities, powering 500+ homes",
    timeline: "12 months",
    category: "Clean Energy",
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
    description: "Empowering women through traditional craft modernization, supporting 50+ artisans",
    timeline: "24 months",
    category: "Social Impact",
  },
]

const features = [
  {
    icon: Shield,
    title: "Blockchain Security",
    description: "Smart contracts ensure transparent and secure investments"
  },
  {
    icon: Clock,
    title: "Quick Setup",
    description: "Start investing in under 5 minutes with our streamlined process"
  },
  {
    icon: Award,
    title: "Verified Entrepreneurs",
    description: "All entrepreneurs undergo rigorous vetting and background checks"
  }
]

// Counter animation hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)
  const inView = useInView(countRef)
  
  useEffect(() => {
    if (!inView) return
    
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = (timestamp - startTime) / duration
      
      if (progress < 1) {
        setCount(Math.floor(end * progress))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, inView])
  
  return { count, ref: countRef }
}

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef)

  // Mouse tracking for hero parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-navy-dark overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center py-20 px-4">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blockchain-green/20 via-transparent to-golden-yellow/20 transition-all duration-700 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1)_0%,transparent_50%)]" />
          
          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blockchain-green/30 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{ 
                y: -100,
                opacity: [0, 1, 0],
              }}
              transition={{ 
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              style={{ left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6"
            >
              <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 text-sm px-4 py-2 mb-6">
                🚀 Blockchain-Powered Investing Platform
              </Badge>
            </motion.div>

            <motion.h1 
              className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-blockchain-green via-emerald-400 to-golden-yellow bg-clip-text text-transparent animate-pulse">
                Invest in Tomorrow's
              </span>
              <br />
              <span className="text-white">Entrepreneurs</span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Empower global entrepreneurs through blockchain-powered micro-investments. 
              <span className="text-blockchain-green font-semibold"> Build wealth</span> while creating
              <span className="text-golden-yellow font-semibold"> positive impact</span> across emerging markets.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-golden-yellow to-yellow-400 hover:from-yellow-400 hover:to-golden-yellow text-navy-dark font-bold text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-golden-yellow/25 transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link href="/explore">
                  Start Investing <ArrowRight className="ml-3 w-6 h-6" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blockchain-green text-blockchain-green hover:bg-blockchain-green hover:text-navy-dark font-bold text-lg px-10 py-6 rounded-xl backdrop-blur-sm bg-blockchain-green/5 hover:shadow-lg transition-all duration-300"
              >
                Become an Entrepreneur
              </Button>
            </motion.div>

            {/* Feature highlights */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <Icon className="w-8 h-8 text-blockchain-green mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-300">{feature.description}</p>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blockchain-green/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Platform <span className="text-blockchain-green">Performance</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real-time metrics showcasing our community's collective impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, ''))
              const { count, ref } = useCounter(numericValue, 2000)
              const suffix = stat.value.replace(/[0-9.]/g, '')
              
              return (
                <motion.div
                  key={stat.label}
                  ref={ref}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <Card className="bg-gradient-to-br from-white to-gray-50 text-navy-dark hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/5 to-golden-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-blockchain-green/10 rounded-xl">
                          <Icon className="w-8 h-8 text-blockchain-green" />
                        </div>
                        <Badge className="bg-blockchain-green/20 text-blockchain-green font-semibold px-3 py-1">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className="text-4xl md:text-5xl font-bold font-heading mb-2 text-navy-dark">
                        {count === numericValue ? stat.value : `${count}${suffix}`}
                      </div>
                      <div className="text-gray-600 font-semibold mb-1">{stat.label}</div>
                      <div className="text-sm text-gray-500">{stat.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Success Stories */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-golden-yellow/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Success <span className="text-golden-yellow">Stories</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real entrepreneurs, real impact. Discover how micro-investments are transforming lives and communities worldwide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-white to-gray-50 text-navy-dark overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 h-full">
                  <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                    <img
                      src={story.image || "/placeholder.svg"}
                      alt={story.business}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-blockchain-green text-white font-semibold shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {story.trustScore}
                    </Badge>
                    <Badge className="absolute top-4 left-4 bg-golden-yellow text-navy-dark font-semibold">
                      {story.category}
                    </Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl font-bold">{story.name}</CardTitle>
                      <Badge variant="outline" className="text-blockchain-green border-blockchain-green">
                        <Globe className="w-3 h-3 mr-1" />
                        {story.location}
                      </Badge>
                    </div>
                    <CardDescription className="text-navy-dark/80 font-semibold text-base">
                      {story.business}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{story.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Funded</div>
                        <div className="font-bold text-blockchain-green">{story.funded}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">ROI</div>
                        <div className="font-bold text-golden-yellow">{story.roi}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">Timeline</div>
                        <div className="font-bold text-navy-dark">{story.timeline}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                      <CheckCircle className="w-5 h-5 text-blockchain-green mr-2" />
                      <span className="text-sm font-semibold text-blockchain-green">Verified Success</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blockchain-green via-emerald-500 to-golden-yellow text-navy-dark relative overflow-hidden border-0">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <CardContent className="p-16 text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                    Ready to Make an Impact?
                  </h2>
                  <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
                    Join thousands of investors creating positive change through micro-investments. 
                    Start your journey today and be part of the future of finance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Button
                      size="lg"
                      className="bg-navy-dark hover:bg-navy-dark/90 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-navy-dark/25 transition-all duration-300 transform hover:scale-105"
                      asChild
                    >
                      <Link href="/explore">
                        Explore Opportunities <ArrowRight className="ml-3 w-6 h-6" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white font-bold text-lg px-10 py-6 rounded-xl transition-all duration-300"
                      asChild
                    >
                      <Link href="/learn-more">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}