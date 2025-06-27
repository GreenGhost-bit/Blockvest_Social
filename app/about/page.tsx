"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Download, Users, Globe, Shield, TrendingUp, Heart, Zap, CheckCircle, Star, Award, Lightbulb } from "lucide-react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"

const missionPoints = [
  {
    icon: Globe,
    title: "Global Financial Inclusion",
    description: "Breaking down barriers to access capital for entrepreneurs in emerging markets worldwide.",
    color: "blockchain-green"
  },
  {
    icon: Shield,
    title: "Transparent & Secure",
    description: "Blockchain technology ensures transparency, security, and immutable transaction records.",
    color: "blue-500"
  },
  {
    icon: TrendingUp,
    title: "Sustainable Returns",
    description: "Creating value for investors while generating positive social and environmental impact.",
    color: "golden-yellow"
  },
  {
    icon: Heart,
    title: "Community-Driven",
    description: "Building a supportive ecosystem where entrepreneurs and investors grow together.",
    color: "pink-500"
  },
]

const processSteps = [
  {
    step: "01",
    title: "Discover",
    icon: Users,
    description: "Browse verified entrepreneurs and their business opportunities. Review trust scores, business plans, and impact metrics.",
    features: ["AI-powered matching", "Real-time verification", "Impact scoring"]
  },
  {
    step: "02", 
    title: "Invest",
    icon: TrendingUp,
    description: "Make micro-investments starting from $25. Your funds are secured by smart contracts and blockchain technology.",
    features: ["Smart contract security", "Instant transactions", "Portfolio tracking"]
  },
  {
    step: "03",
    title: "Impact",
    icon: Heart,
    description: "Receive regular updates and returns while creating positive social and environmental impact in emerging markets.",
    features: ["Real-time updates", "Impact measurement", "Community engagement"]
  },
]

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    background: "Former Goldman Sachs, Harvard MBA",
    image: "/placeholder.svg?height=150&width=150&query=professional woman",
    expertise: ["Financial Markets", "Impact Investing", "Strategy"],
    achievements: "15+ years Wall Street experience",
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder", 
    background: "Ex-Ethereum Foundation, MIT Computer Science",
    image: "/placeholder.svg?height=150&width=150&query=professional man",
    expertise: ["Blockchain", "Smart Contracts", "Security"],
    achievements: "Core Ethereum contributor",
  },
  {
    name: "Dr. Amara Okafor",
    role: "Head of Impact",
    background: "Former World Bank, PhD Development Economics",
    image: "/placeholder.svg?height=150&width=150&query=professional woman africa",
    expertise: ["Development Economics", "Impact Measurement", "ESG"],
    achievements: "Published 50+ research papers",
  },
  {
    name: "James Thompson",
    role: "Head of Product",
    background: "Ex-Stripe, Stanford Design",
    image: "/placeholder.svg?height=150&width=150&query=professional man tech",
    expertise: ["Product Strategy", "UX Design", "Fintech"],
    achievements: "Built products for 10M+ users",
  },
]

const stats = [
  { label: "Years of Experience", value: "50+", description: "Combined team expertise" },
  { label: "Countries Reached", value: "45", description: "Global presence" },
  { label: "Security Audits", value: "12", description: "Comprehensive testing" },
  { label: "Partner Organizations", value: "200+", description: "Trusted network" },
]

const faqs = [
  {
    question: "How does Blockvest Social work?",
    answer: "Blockvest Social connects investors with verified entrepreneurs in emerging markets. Investors can browse opportunities, conduct due diligence, and make micro-investments starting from $25. All transactions are secured by blockchain technology, and investors receive regular updates on their investments' progress.",
    category: "Getting Started"
  },
  {
    question: "What makes an entrepreneur eligible for funding?",
    answer: "Entrepreneurs must complete our verification process, which includes identity verification, business plan review, and local partner validation. We assess factors like business viability, social impact potential, and the entrepreneur's track record. Our trust score system helps investors make informed decisions.",
    category: "Entrepreneurs"
  },
  {
    question: "How are returns calculated and distributed?",
    answer: "Returns are based on the agreed terms with each entrepreneur, typically ranging from 12-25% annually. Payments are made monthly or quarterly depending on the business model. All transactions are recorded on the blockchain for transparency, and investors can track their returns in real-time.",
    category: "Investing"
  },
  {
    question: "What happens if an entrepreneur defaults?",
    answer: "While we carefully vet all entrepreneurs, defaults can occur. We have a comprehensive risk management system including insurance partnerships, local collection networks, and alternative resolution mechanisms. Our diversification tools help investors spread risk across multiple opportunities.",
    category: "Risk Management"
  },
  {
    question: "How does the governance system work?",
    answer: "Token holders can participate in platform governance by voting on proposals that affect platform operations, fee structures, and new features. Voting power is determined by token holdings and reputation score. All governance decisions are implemented transparently through smart contracts.",
    category: "Governance"
  },
  {
    question: "What are NFT badges and how do I earn them?",
    answer: "NFT badges are unique digital achievements that recognize your contributions to the platform. You can earn them through various activities like making your first investment, achieving certain return thresholds, or participating in governance. These badges provide benefits like reduced fees and priority access to opportunities.",
    category: "Rewards"
  },
  {
    question: "Is my investment secure?",
    answer: "We employ multiple security layers including blockchain technology, smart contracts, multi-signature wallets, and regular security audits. Your funds are protected by industry-leading security practices, and all transactions are transparent and verifiable on the blockchain.",
    category: "Security"
  },
  {
    question: "How can I withdraw my earnings?",
    answer: "You can withdraw your earnings to your connected wallet at any time, or use them in our Impact Marketplace to purchase products from entrepreneurs you've invested in. Withdrawals are processed instantly through smart contracts with minimal fees.",
    category: "Withdrawals"
  },
]

const resources = [
  {
    title: "Whitepaper",
    description: "Technical documentation and platform architecture",
    icon: Download,
    color: "blockchain-green",
    badge: "Technical"
  },
  {
    title: "API Documentation", 
    description: "Developer resources and integration guides",
    icon: ExternalLink,
    color: "golden-yellow",
    badge: "Developer"
  },
  {
    title: "Smart Contracts",
    description: "Blockchain verification and audit reports",
    icon: Zap,
    color: "blue-500",
    badge: "Blockchain"
  },
]

export default function AboutPage() {
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("All")
  const heroRef = useRef(null)
  const isHeroInView = useInView(heroRef)

  const faqCategories = ["All", ...Array.from(new Set(faqs.map(faq => faq.category)))]
  const filteredFaqs = selectedFaqCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedFaqCategory)

  return (
    <div className="min-h-screen bg-navy-dark overflow-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/10 via-transparent to-golden-yellow/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.1)_0%,transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 text-sm px-4 py-2 mb-6">
              🌍 Democratizing Global Finance
            </Badge>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              About <span className="bg-gradient-to-r from-blockchain-green to-golden-yellow bg-clip-text text-transparent">Blockvest</span> Social
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Democratizing access to capital and creating opportunities for entrepreneurs in emerging markets through
              <span className="text-blockchain-green font-semibold"> blockchain-powered</span> micro-investments.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-blockchain-green mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-xs text-gray-400">{stat.description}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blockchain-green/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-blockchain-green via-emerald-500 to-golden-yellow text-navy-dark border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
              <CardContent className="p-12 md:p-16 relative z-10">
                <div className="text-center mb-16">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Our Mission</h2>
                    <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                      To create a world where every entrepreneur, regardless of location or background, has access to the
                      capital they need to build sustainable businesses and create positive impact.
                    </p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {missionPoints.map((point, index) => {
                    const Icon = point.icon
                    return (
                      <motion.div
                        key={point.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="text-center group"
                      >
                        <div className="w-20 h-20 bg-navy-dark/90 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-navy-dark transition-colors duration-300 shadow-lg">
                          <Icon className="w-10 h-10 text-blockchain-green" />
                        </div>
                        <h3 className="font-bold text-xl mb-4">{point.title}</h3>
                        <p className="text-sm opacity-90 leading-relaxed">{point.description}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
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
              How It <span className="text-golden-yellow">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A simple, transparent process that creates value for everyone in our ecosystem
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white to-gray-50 border-0 h-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/5 to-golden-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blockchain-green to-emerald-400 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blockchain-green font-mono">{step.step}</div>
                          <h3 className="text-2xl font-bold text-navy-dark">{step.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                      
                      <div className="space-y-3">
                        {step.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-blockchain-green mr-3 flex-shrink-0" />
                            <span className="text-sm text-gray-600 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Meet Our <span className="text-blockchain-green">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experienced professionals passionate about financial inclusion and blockchain innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 overflow-hidden h-full">
                  <div className="relative p-8 text-center">
                    <div className="relative mb-6">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blockchain-green/20 group-hover:border-blockchain-green/40 transition-colors duration-300"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blockchain-green rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl text-navy-dark mb-2">{member.name}</h3>
                    <p className="text-blockchain-green font-semibold mb-3">{member.role}</p>
                    <p className="text-sm text-gray-600 mb-4">{member.background}</p>
                    
                    <div className="mb-4">
                      <Badge className="bg-golden-yellow/20 text-golden-yellow text-xs px-2 py-1 mb-2">
                        {member.achievements}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs border-blockchain-green/30 text-blockchain-green">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Everything you need to know about Blockvest Social
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {faqCategories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedFaqCategory(category)}
                  variant={selectedFaqCategory === category ? "default" : "outline"}
                  className={`${
                    selectedFaqCategory === category
                      ? "bg-blockchain-green text-navy-dark hover:bg-blockchain-green/90"
                      : "border-blockchain-green/30 text-blockchain-green hover:bg-blockchain-green hover:text-navy-dark"
                  } transition-all duration-300`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50 border-0 overflow-hidden">
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <AccordionItem value={`item-${index}`} className="border-b border-gray-200 last:border-b-0">
                        <AccordionTrigger className="text-left text-navy-dark font-semibold hover:text-blockchain-green transition-colors duration-300 py-6">
                          <div className="flex items-center">
                            <Lightbulb className="w-5 h-5 text-blockchain-green mr-3 flex-shrink-0" />
                            {faq.question}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-br from-navy-dark via-slate-800 to-navy-dark border border-blockchain-green/20 overflow-hidden relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-5" />
              <CardHeader className="text-center relative z-10">
                <CardTitle className="text-white text-4xl md:text-5xl font-heading mb-4">
                  Resources & Documentation
                </CardTitle>
                <CardDescription className="text-gray-300 text-xl">
                  Learn more about our technology, vision, and implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {resources.map((resource, index) => {
                    const Icon = resource.icon
                    return (
                      <motion.div
                        key={resource.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <Button
                          variant="outline"
                          className={`h-auto p-8 w-full border-2 border-${resource.color}/30 text-${resource.color} hover:bg-${resource.color} hover:text-navy-dark transition-all duration-300 group`}
                          asChild
                        >
                          <Link href="#" className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <Icon className="w-12 h-12" />
                              <Badge className={`absolute -top-2 -right-2 bg-${resource.color} text-navy-dark text-xs px-2 py-1`}>
                                {resource.badge}
                              </Badge>
                            </div>
                            <div className="text-center">
                              <span className="font-bold text-lg block mb-2">{resource.title}</span>
                              <span className="text-sm opacity-80">{resource.description}</span>
                            </div>
                          </Link>
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
                
                <motion.div 
                  className="text-center mt-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <p className="text-gray-300 mb-6">
                    Have questions or need support? Our team is here to help.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blockchain-green to-emerald-400 hover:from-emerald-400 hover:to-blockchain-green text-navy-dark font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-blockchain-green/25 transition-all duration-300"
                    asChild
                  >
                    <Link href="/contact">
                      Get in Touch
                    </Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}