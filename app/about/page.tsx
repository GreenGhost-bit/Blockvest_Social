"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  Target, 
  Award, 
  Globe, 
  TrendingUp, 
  Shield, 
  Heart,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react"
import Link from "next/link"

const stats = [
  { label: "Global Reach", value: "45+", suffix: "Countries", icon: Globe },
  { label: "Entrepreneurs Funded", value: "1,247", suffix: "Businesses", icon: Users },
  { label: "Success Rate", value: "94%", suffix: "ROI", icon: TrendingUp },
  { label: "Total Deployed", value: "$2.4M", suffix: "Capital", icon: Award },
]

const values = [
  {
    icon: Heart,
    title: "Impact First",
    description: "We believe in creating positive social and economic impact through strategic micro-investments that empower entrepreneurs in emerging markets."
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "Blockchain technology ensures complete transparency in all transactions, giving investors full visibility into how their capital is deployed."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge DeFi protocols and smart contracts to create new opportunities for both investors and entrepreneurs."
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a global community of conscious investors who support sustainable business growth and economic empowerment."
  }
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    description: "Former Goldman Sachs VP with 12+ years in emerging markets finance",
    image: "/placeholder.svg?height=300&width=300",
    linkedin: "#"
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder", 
    description: "Blockchain architect with expertise in DeFi protocols and smart contracts",
    image: "/placeholder.svg?height=300&width=300",
    linkedin: "#"
  },
  {
    name: "Dr. Aisha Patel",
    role: "Head of Impact",
    description: "Development economist focused on microfinance and financial inclusion",
    image: "/placeholder.svg?height=300&width=300",
    linkedin: "#"
  },
  {
    name: "James Wilson",
    role: "Head of Operations",
    description: "Former McKinsey consultant specializing in emerging market expansion",
    image: "/placeholder.svg?height=300&width=300",
    linkedin: "#"
  }
]

const milestones = [
  {
    year: "2021",
    title: "Company Founded",
    description: "BlockVest Social was founded with a mission to democratize investment in emerging markets"
  },
  {
    year: "2022", 
    title: "Platform Launch",
    description: "Launched our first blockchain-powered investment platform connecting global investors"
  },
  {
    year: "2023",
    title: "Series A Funding",
    description: "Raised $5M Series A to expand operations across Southeast Asia and Latin America"
  },
  {
    year: "2024",
    title: "Global Expansion",
    description: "Reached 45+ countries with over 1,200 entrepreneurs successfully funded"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/10 via-transparent to-golden-yellow/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 mb-6">
              About BlockVest Social
            </Badge>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Empowering Tomorrow's
              <span className="text-gradient block">Entrepreneurs</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              We're revolutionizing how the world invests in emerging market entrepreneurs, 
              combining blockchain technology with social impact to create sustainable wealth 
              for both investors and business owners.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center hover:scale-105 transition-transform duration-300">
                    <CardContent className="p-6">
                      <Icon className="w-8 h-8 text-blockchain-green mx-auto mb-4" />
                      <div className="text-3xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-400 mb-1">{stat.suffix}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
                Our <span className="text-golden-yellow">Mission</span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                To democratize access to capital for entrepreneurs in emerging markets while 
                providing investors with transparent, high-impact investment opportunities that 
                generate both financial returns and positive social change.
              </p>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Through blockchain technology, we're building a bridge between global capital 
                and local innovation, ensuring that great ideas can flourish regardless of 
                geographical or economic barriers.
              </p>
              <div className="space-y-3">
                {[
                  "Transparent blockchain-based transactions",
                  "Rigorous entrepreneur vetting process", 
                  "Continuous impact measurement and reporting",
                  "Community-driven investment decisions"
                ].map((point, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-blockchain-green flex-shrink-0" />
                    <span className="text-gray-300">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-2xl p-8 flex items-center justify-center">
                <div className="text-center">
                  <Target className="w-16 h-16 text-blockchain-green mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Impact Goal</h3>
                  <p className="text-4xl font-bold text-golden-yellow mb-2">10,000</p>
                  <p className="text-gray-300">Entrepreneurs funded by 2025</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-blockchain-green/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
              Our <span className="text-blockchain-green">Values</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The principles that guide every decision and shape our platform's evolution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 h-full hover:scale-105 transition-transform duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blockchain-green/20 rounded-lg">
                          <Icon className="w-6 h-6 text-blockchain-green" />
                        </div>
                        <CardTitle className="text-xl text-white">{value.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
              Meet Our <span className="text-golden-yellow">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experienced professionals passionate about creating positive impact through technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-full mb-4 mx-auto w-24 h-24 flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-blockchain-green font-semibold mb-3">{member.role}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-golden-yellow/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
              Our <span className="text-golden-yellow">Journey</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Key milestones in building the future of social impact investing
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex items-center mb-12 last:mb-0"
              >
                <div className="flex-1">
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 text-lg px-3 py-1">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-300">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blockchain-green via-emerald-500 to-golden-yellow text-navy-dark">
              <CardContent className="p-12 text-center">
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                  Ready to Make an Impact?
                </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join our community of conscious investors and help entrepreneurs 
                  around the world build successful, sustainable businesses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-navy-dark hover:bg-navy-dark/90 text-white font-bold"
                    asChild
                  >
                    <Link href="/explore">
                      Start Investing <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white font-bold"
                    asChild
                  >
                    <Link href="/explore">
                      Become an Entrepreneur
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}