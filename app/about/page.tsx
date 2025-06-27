"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ExternalLink, Download, Users, Globe, Shield, TrendingUp, Heart, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const missionPoints = [
  {
    icon: Globe,
    title: "Global Financial Inclusion",
    description: "Breaking down barriers to access capital for entrepreneurs in emerging markets worldwide.",
  },
  {
    icon: Shield,
    title: "Transparent & Secure",
    description: "Blockchain technology ensures transparency, security, and immutable transaction records.",
  },
  {
    icon: TrendingUp,
    title: "Sustainable Returns",
    description: "Creating value for investors while generating positive social and environmental impact.",
  },
  {
    icon: Heart,
    title: "Community-Driven",
    description: "Building a supportive ecosystem where entrepreneurs and investors grow together.",
  },
]

const teamMembers = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    background: "Former Goldman Sachs, Harvard MBA",
    image: "/placeholder.svg?height=150&width=150&query=professional woman",
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder",
    background: "Ex-Ethereum Foundation, MIT Computer Science",
    image: "/placeholder.svg?height=150&width=150&query=professional man",
  },
  {
    name: "Dr. Amara Okafor",
    role: "Head of Impact",
    background: "Former World Bank, PhD Development Economics",
    image: "/placeholder.svg?height=150&width=150&query=professional woman africa",
  },
  {
    name: "James Thompson",
    role: "Head of Product",
    background: "Ex-Stripe, Stanford Design",
    image: "/placeholder.svg?height=150&width=150&query=professional man tech",
  },
]

const faqs = [
  {
    question: "How does Blockvest Social work?",
    answer:
      "Blockvest Social connects investors with verified entrepreneurs in emerging markets. Investors can browse opportunities, conduct due diligence, and make micro-investments starting from $25. All transactions are secured by blockchain technology, and investors receive regular updates on their investments' progress.",
  },
  {
    question: "What makes an entrepreneur eligible for funding?",
    answer:
      "Entrepreneurs must complete our verification process, which includes identity verification, business plan review, and local partner validation. We assess factors like business viability, social impact potential, and the entrepreneur's track record. Our trust score system helps investors make informed decisions.",
  },
  {
    question: "How are returns calculated and distributed?",
    answer:
      "Returns are based on the agreed terms with each entrepreneur, typically ranging from 12-25% annually. Payments are made monthly or quarterly depending on the business model. All transactions are recorded on the blockchain for transparency, and investors can track their returns in real-time.",
  },
  {
    question: "What happens if an entrepreneur defaults?",
    answer:
      "While we carefully vet all entrepreneurs, defaults can occur. We have a comprehensive risk management system including insurance partnerships, local collection networks, and alternative resolution mechanisms. Our diversification tools help investors spread risk across multiple opportunities.",
  },
  {
    question: "How does the governance system work?",
    answer:
      "Token holders can participate in platform governance by voting on proposals that affect platform operations, fee structures, and new features. Voting power is determined by token holdings and reputation score. All governance decisions are implemented transparently through smart contracts.",
  },
  {
    question: "What are NFT badges and how do I earn them?",
    answer:
      "NFT badges are unique digital achievements that recognize your contributions to the platform. You can earn them through various activities like making your first investment, achieving certain return thresholds, or participating in governance. These badges provide benefits like reduced fees and priority access to opportunities.",
  },
  {
    question: "Is my investment secure?",
    answer:
      "We employ multiple security layers including blockchain technology, smart contracts, multi-signature wallets, and regular security audits. Your funds are protected by industry-leading security practices, and all transactions are transparent and verifiable on the blockchain.",
  },
  {
    question: "How can I withdraw my earnings?",
    answer:
      "You can withdraw your earnings to your connected wallet at any time, or use them in our Impact Marketplace to purchase products from entrepreneurs you've invested in. Withdrawals are processed instantly through smart contracts with minimal fees.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-navy-dark py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">About Blockvest Social</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Democratizing access to capital and creating opportunities for entrepreneurs in emerging markets through
            blockchain-powered micro-investments.
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-blockchain-green to-golden-yellow text-navy-dark">
            <CardContent className="p-12">
              <div className="text-center mb-12">
                <h2 className="font-heading text-4xl font-bold mb-4">Our Mission</h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto">
                  To create a world where every entrepreneur, regardless of location or background, has access to the
                  capital they need to build sustainable businesses and create positive impact.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {missionPoints.map((point, index) => {
                  const Icon = point.icon
                  return (
                    <motion.div
                      key={point.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-navy-dark rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-blockchain-green" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{point.title}</h3>
                      <p className="text-sm opacity-90">{point.description}</p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <Card className="bg-light-bg">
            <CardHeader className="text-center">
              <CardTitle className="text-navy-dark text-3xl font-heading">How It Works</CardTitle>
              <CardDescription className="text-lg">
                A simple, transparent process that benefits everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blockchain-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-blockchain-green" />
                  </div>
                  <h3 className="font-semibold text-lg text-navy-dark mb-2">1. Discover</h3>
                  <p className="text-gray-600">
                    Browse verified entrepreneurs and their business opportunities. Review trust scores, business plans,
                    and impact metrics.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-golden-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-10 h-10 text-golden-yellow" />
                  </div>
                  <h3 className="font-semibold text-lg text-navy-dark mb-2">2. Invest</h3>
                  <p className="text-gray-600">
                    Make micro-investments starting from $25. Your funds are secured by smart contracts and blockchain
                    technology.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-navy-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-10 h-10 text-navy-dark" />
                  </div>
                  <h3 className="font-semibold text-lg text-navy-dark mb-2">3. Impact</h3>
                  <p className="text-gray-600">
                    Receive regular updates and returns while creating positive social and environmental impact in
                    emerging markets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="bg-light-bg">
            <CardHeader className="text-center">
              <CardTitle className="text-navy-dark text-3xl font-heading">Our Team</CardTitle>
              <CardDescription className="text-lg">
                Experienced professionals passionate about financial inclusion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="text-center"
                  >
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="font-semibold text-lg text-navy-dark">{member.name}</h3>
                    <p className="text-blockchain-green font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-600">{member.background}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-light-bg">
            <CardHeader className="text-center">
              <CardTitle className="text-navy-dark text-3xl font-heading">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-lg">Everything you need to know about Blockvest Social</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-navy-dark font-medium">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources & Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <Card className="bg-navy-dark border-blockchain-green/30">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-3xl font-heading">Resources & Documentation</CardTitle>
              <CardDescription className="text-gray-300 text-lg">
                Learn more about our technology and vision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  variant="outline"
                  className="h-auto p-6 border-blockchain-green text-blockchain-green hover:bg-blockchain-green hover:text-navy-dark"
                  asChild
                >
                  <Link href="#" className="flex flex-col items-center space-y-2">
                    <Download className="w-8 h-8" />
                    <span className="font-semibold">Whitepaper</span>
                    <span className="text-sm opacity-80">Technical documentation</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 border-golden-yellow text-golden-yellow hover:bg-golden-yellow hover:text-navy-dark"
                  asChild
                >
                  <Link href="#" className="flex flex-col items-center space-y-2">
                    <ExternalLink className="w-8 h-8" />
                    <span className="font-semibold">API Documentation</span>
                    <span className="text-sm opacity-80">Developer resources</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 border-white text-white hover:bg-white hover:text-navy-dark"
                  asChild
                >
                  <Link href="#" className="flex flex-col items-center space-y-2">
                    <Zap className="w-8 h-8" />
                    <span className="font-semibold">Smart Contracts</span>
                    <span className="text-sm opacity-80">Blockchain verification</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
