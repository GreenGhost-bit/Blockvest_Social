"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card"
import { Badge } from "@/frontend/components/ui/badge"
import { Button } from "@/frontend/components/ui/button"
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
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Plus,
  Minus,
  Send,
  MessageSquare,
  Clock,
  Eye,
  Zap,
  Rocket,
  Trophy,
  Handshake,
  FileText,
  BarChart3,
  DollarSign,
  Linkedin,
  Twitter,
  Github,
  Facebook,
  Instagram,
  PlayCircle,
  Quote
} from "lucide-react"
import Link from "next/link"

// Enhanced stats with animated counters
const stats = [
  { 
    label: "Global Reach", 
    value: 45, 
    suffix: "Countries", 
    icon: Globe, 
    color: "text-blockchain-green",
    description: "Serving entrepreneurs across 6 continents"
  },
  { 
    label: "Entrepreneurs Funded", 
    value: 1247, 
    suffix: "Businesses", 
    icon: Users, 
    color: "text-blue-400",
    description: "Successful ventures launched"
  },
  { 
    label: "Success Rate", 
    value: 94, 
    suffix: "% ROI", 
    icon: TrendingUp, 
    color: "text-emerald-400",
    description: "Above-average returns achieved"
  },
  { 
    label: "Total Deployed", 
    value: 2.4, 
    suffix: "M Capital", 
    icon: DollarSign, 
    color: "text-golden-yellow",
    description: "USD invested in global ventures"
  },
  { 
    label: "Community Members", 
    value: 15600, 
    suffix: "Investors", 
    icon: Handshake, 
    color: "text-purple-400",
    description: "Active platform users"
  },
  { 
    label: "Average Return", 
    value: 18.7, 
    suffix: "% Annual", 
    icon: BarChart3, 
    color: "text-orange-400",
    description: "Portfolio performance"
  }
]

// Enhanced values with more details
const values = [
  {
    icon: Heart,
    title: "Impact First",
    description: "We believe in creating positive social and economic impact through strategic micro-investments that empower entrepreneurs in emerging markets.",
    details: [
      "Prioritize sustainable business models",
      "Measure social impact alongside financial returns",
      "Support underserved communities",
      "Foster inclusive economic growth"
    ]
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "Blockchain technology ensures complete transparency in all transactions, giving investors full visibility into how their capital is deployed.",
    details: [
      "Open-source smart contracts",
      "Real-time transaction tracking",
      "Public impact reporting",
      "Immutable investment records"
    ]
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge DeFi protocols and smart contracts to create new opportunities for both investors and entrepreneurs.",
    details: [
      "AI-powered risk assessment",
      "Automated compliance systems",
      "Cross-border payment solutions",
      "Decentralized governance"
    ]
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a global community of conscious investors who support sustainable business growth and economic empowerment.",
    details: [
      "Peer-to-peer learning networks",
      "Collaborative investment decisions",
      "Knowledge sharing platforms",
      "Mentorship programs"
    ]
  }
]

// Enhanced team with more details
const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-Founder",
    description: "Former Goldman Sachs VP with 12+ years in emerging markets finance",
    image: "/placeholder.svg?height=400&width=400",
    linkedin: "https://linkedin.com/in/sarah-chen",
    twitter: "https://twitter.com/sarahchen",
    experience: "12+ years",
    education: "MBA Harvard Business School",
    specialization: "Emerging Markets Finance",
    achievements: [
      "Led $2B+ in emerging market investments",
      "Named Top 40 Under 40 in Finance",
      "Speaker at 50+ international conferences"
    ]
  },
  {
    name: "Marcus Rodriguez",
    role: "CTO & Co-Founder", 
    description: "Blockchain architect with expertise in DeFi protocols and smart contracts",
    image: "/placeholder.svg?height=400&width=400",
    linkedin: "https://linkedin.com/in/marcus-rodriguez",
    github: "https://github.com/marcusrodriguez",
    experience: "10+ years",
    education: "MS Computer Science MIT",
    specialization: "Blockchain & DeFi",
    achievements: [
      "Built 15+ DeFi protocols",
      "Published 25+ research papers",
      "Former Ethereum Foundation contributor"
    ]
  },
  {
    name: "Dr. Aisha Patel",
    role: "Head of Impact",
    description: "Development economist focused on microfinance and financial inclusion",
    image: "/placeholder.svg?height=400&width=400",
    linkedin: "https://linkedin.com/in/aisha-patel",
    twitter: "https://twitter.com/aishaimpact",
    experience: "15+ years",
    education: "PhD Economics Oxford",
    specialization: "Development Economics",
    achievements: [
      "Published 40+ academic papers",
      "Advised World Bank on financial inclusion",
      "TED Talk: 'Microfinance Revolution'"
    ]
  },
  {
    name: "James Wilson",
    role: "Head of Operations",
    description: "Former McKinsey consultant specializing in emerging market expansion",
    image: "/placeholder.svg?height=400&width=400",
    linkedin: "https://linkedin.com/in/james-wilson",
    twitter: "https://twitter.com/jameswilson",
    experience: "8+ years",
    education: "MBA Stanford GSB",
    specialization: "Operations & Strategy",
    achievements: [
      "Scaled 20+ companies internationally",
      "Optimized operations for 500% growth",
      "Led market entry into 15 countries"
    ]
  }
]

// Enhanced timeline with more details
const milestones = [
  {
    year: "2021",
    month: "March",
    title: "Company Founded",
    description: "BlockVest Social was founded with a mission to democratize investment in emerging markets",
    details: [
      "Incorporated in Delaware",
      "Raised $500K pre-seed funding",
      "Assembled founding team",
      "Developed initial prototype"
    ],
    image: "/placeholder.svg?height=200&width=300&query=company founding"
  },
  {
    year: "2022", 
    month: "January",
    title: "Platform Launch",
    description: "Launched our first blockchain-powered investment platform connecting global investors",
    details: [
      "Beta launch with 100 users",
      "First $50K deployed",
      "5 entrepreneurs funded",
      "Partnership with Algorand"
    ],
    image: "/placeholder.svg?height=200&width=300&query=platform launch"
  },
  {
    year: "2023",
    month: "June",
    title: "Series A Funding",
    description: "Raised $5M Series A to expand operations across Southeast Asia and Latin America",
    details: [
      "Led by Andreessen Horowitz",
      "Expanded to 15 countries",
      "Hired 25 employees",
      "Launched mobile app"
    ],
    image: "/placeholder.svg?height=200&width=300&query=series A funding"
  },
  {
    year: "2024",
    month: "March",
    title: "Global Expansion",
    description: "Reached 45+ countries with over 1,200 entrepreneurs successfully funded",
    details: [
      "Exceeded $2M deployed",
      "10,000+ registered users",
      "Partnerships in 45 countries",
      "Launched governance token"
    ],
    image: "/placeholder.svg?height=200&width=300&query=global expansion"
  }
]

// Testimonials
const testimonials = [
  {
    name: "Ahmed Hassan",
    role: "Solar Panel Manufacturer",
    location: "Cairo, Egypt",
    content: "BlockVest Social didn't just provide funding - they connected me with a global network of mentors and customers. My business grew 300% in 18 months.",
    rating: 5,
    investment: "$25,000",
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Maria Santos",
    role: "Coffee Farm Owner",
    location: "São Paulo, Brazil",
    content: "The transparency and support I received was incredible. Every investor could see exactly how their money was being used to grow my sustainable coffee business.",
    rating: 5,
    investment: "$15,000",
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "David Kim",
    role: "Angel Investor",
    location: "San Francisco, USA",
    content: "I've invested in 12 entrepreneurs through BlockVest. The platform's due diligence and blockchain transparency gives me confidence in every investment.",
    rating: 5,
    investment: "$50,000",
    image: "/placeholder.svg?height=100&width=100"
  },
  {
    name: "Priya Sharma",
    role: "Textile Entrepreneur",
    location: "Mumbai, India",
    content: "From application to funding took just 2 weeks. The streamlined process and ongoing support helped me scale my business to serve 500+ artisans.",
    rating: 5,
    investment: "$18,000",
    image: "/placeholder.svg?height=100&width=100"
  }
]

// FAQ data
const faqs = [
  {
    question: "How does BlockVest Social work?",
    answer: "BlockVest Social is a blockchain-powered platform that connects global investors with verified entrepreneurs in emerging markets. Investors can browse opportunities, conduct due diligence, and invest directly through smart contracts. All transactions are transparent and tracked on the blockchain."
  },
  {
    question: "What is the minimum investment amount?",
    answer: "The minimum investment varies by opportunity, typically starting from $50. This low threshold allows more people to participate in global entrepreneurship and diversify their investments across multiple ventures."
  },
  {
    question: "How are entrepreneurs vetted?",
    answer: "We have a rigorous 7-step vetting process including background checks, business plan analysis, market validation, financial audits, reference checks, and on-site visits. Less than 5% of applications are approved."
  },
  {
    question: "What returns can I expect?",
    answer: "While past performance doesn't guarantee future results, our platform has achieved an average annual return of 18.7% with a 94% success rate. Returns vary by sector, geography, and individual business performance."
  },
  {
    question: "Is my investment secure?",
    answer: "All investments are secured through blockchain smart contracts and our platform maintains comprehensive insurance coverage. We also provide real-time monitoring and regular progress reports on all funded ventures."
  },
  {
    question: "How do I get started?",
    answer: "Simply create an account, complete our investor verification process, browse available opportunities, and start investing. Our team is available 24/7 to help you through the process."
  }
]

// Awards and recognition
const awards = [
  {
    title: "Best FinTech Innovation",
    organization: "TechCrunch Disrupt 2024",
    year: "2024",
    description: "Recognized for revolutionary approach to global investment"
  },
  {
    title: "Top 10 Impact Startups",
    organization: "Forbes Social Impact List",
    year: "2023",
    description: "Selected for significant social and economic impact"
  },
  {
    title: "Blockchain Excellence Award",
    organization: "Blockchain Summit Asia",
    year: "2023",
    description: "Outstanding implementation of blockchain technology"
  },
  {
    title: "Fintech Company of the Year",
    organization: "Asian Banking & Finance",
    year: "2022",
    description: "Leading innovation in financial inclusion"
  }
]

// Partner logos
const partners = [
  { name: "Algorand", logo: "/placeholder.svg?height=60&width=120&query=algorand" },
  { name: "Mastercard", logo: "/placeholder.svg?height=60&width=120&query=mastercard" },
  { name: "UNICEF", logo: "/placeholder.svg?height=60&width=120&query=unicef" },
  { name: "World Bank", logo: "/placeholder.svg?height=60&width=120&query=world bank" },
  { name: "UN Global Compact", logo: "/placeholder.svg?height=60&width=120&query=un global compact" },
  { name: "Microsoft", logo: "/placeholder.svg?height=60&width=120&query=microsoft" }
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

export default function AboutPage() {
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | null>(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [newsletterEmail, setNewsletterEmail] = useState('')

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Contact form submitted:', contactForm)
    // Reset form
    setContactForm({ name: '', email: '', message: '' })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log('Newsletter signup:', newsletterEmail)
    setNewsletterEmail('')
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Enhanced Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/10 via-transparent to-golden-yellow/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 text-lg px-6 py-3 mb-6">
                <Building className="w-5 h-5 mr-2" />
                About BlockVest Social
              </Badge>
            </motion.div>

            <motion.h1 
              className="font-heading text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Empowering Tomorrow's
              <span className="bg-gradient-to-r from-blockchain-green via-emerald-400 to-golden-yellow bg-clip-text text-transparent block">
                Entrepreneurs
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              We're revolutionizing how the world invests in emerging market entrepreneurs, 
              combining blockchain technology with social impact to create sustainable wealth 
              for both investors and business owners.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-blockchain-green to-emerald-500 hover:from-emerald-500 hover:to-blockchain-green text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-blockchain-green/25 transition-all duration-300 transform hover:scale-105"
                asChild
              >
                <Link href="/explore">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blockchain-green text-blockchain-green hover:bg-blockchain-green hover:text-white font-bold text-lg px-8 py-4 rounded-xl backdrop-blur-sm bg-blockchain-green/5 hover:shadow-lg transition-all duration-300"
                asChild
              >
                <Link href="#contact">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Get In Touch
                </Link>
              </Button>
            </motion.div>

            {/* Quick Stats Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {stats.slice(0, 4).map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-white">{stat.value}{stat.suffix}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Stats Section with Counters */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-blockchain-green/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="text-blockchain-green">Impact</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real numbers that reflect our commitment to global entrepreneurship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              const { count, ref } = useCounter(stat.value, 2000)
              
              return (
                <motion.div
                  key={stat.label}
                  ref={ref}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/5 to-golden-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center justify-center mb-6">
                        <div className="p-4 bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-2xl">
                          <Icon className={`w-10 h-10 ${stat.color}`} />
                        </div>
                      </div>
                      
                      <div className="text-4xl md:text-5xl font-bold font-heading mb-3 text-white">
                        {count === stat.value ? (
                          <span>
                            {stat.value >= 1000 ? (stat.value / 1000).toFixed(1) + 'K' : stat.value}
                            <span className="text-2xl ml-1">{stat.suffix}</span>
                          </span>
                        ) : (
                          <span>
                            {count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}
                            <span className="text-2xl ml-1">{stat.suffix}</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="text-lg font-semibold text-gray-300 mb-2">{stat.label}</div>
                      <div className="text-sm text-gray-400">{stat.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-6">
                <Target className="w-4 h-4 mr-2" />
                Our Mission
              </Badge>
              
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-8">
                Democratizing Global <span className="text-golden-yellow">Investment</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                To democratize access to capital for entrepreneurs in emerging markets while 
                providing investors with transparent, high-impact investment opportunities that 
                generate both financial returns and positive social change.
              </p>
              
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Through blockchain technology, we're building a bridge between global capital 
                and local innovation, ensuring that great ideas can flourish regardless of 
                geographical or economic barriers.
              </p>
              
              <div className="space-y-4 mb-10">
                {[
                  "Transparent blockchain-based transactions",
                  "Rigorous entrepreneur vetting process", 
                  "Continuous impact measurement and reporting",
                  "Community-driven investment decisions",
                  "Real-time portfolio monitoring",
                  "Global mentor network access"
                ].map((point, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 group"
                  >
                    <div className="p-2 bg-blockchain-green/20 rounded-lg group-hover:bg-blockchain-green/30 transition-colors">
                      <CheckCircle className="w-5 h-5 text-blockchain-green" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{point}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-golden-yellow to-yellow-500 hover:from-yellow-500 hover:to-golden-yellow text-navy-dark font-bold"
                  asChild
                >
                  <Link href="/explore">
                    <Eye className="w-5 h-5 mr-2" />
                    Explore Opportunities
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                  asChild
                >
                  <Link href="#whitepaper">
                    <Download className="w-5 h-5 mr-2" />
                    Download Whitepaper
                  </Link>
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-3xl p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="text-center relative z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                  >
                    <Target className="w-24 h-24 text-blockchain-green mx-auto" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-4">Impact Goal</h3>
                  <p className="text-6xl font-bold text-golden-yellow mb-4">10,000</p>
                  <p className="text-xl text-gray-300">Entrepreneurs funded by 2025</p>
                  <div className="mt-8 grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blockchain-green">2,847</div>
                      <div className="text-sm text-gray-400">Current Progress</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-golden-yellow">28.5%</div>
                      <div className="text-sm text-gray-400">Goal Achieved</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Values Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-blockchain-green/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Our Values
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              What Drives <span className="text-blockchain-green">Us</span>
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
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 h-full hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/5 to-golden-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative z-10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-4 bg-blockchain-green/20 rounded-xl group-hover:bg-blockchain-green/30 transition-colors">
                          <Icon className="w-8 h-8 text-blockchain-green" />
                        </div>
                        <CardTitle className="text-2xl text-white">{value.title}</CardTitle>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-lg">{value.description}</p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="space-y-3">
                        {value.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blockchain-green rounded-full flex-shrink-0" />
                            <span className="text-gray-400 text-sm">{detail}</span>
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

      {/* Enhanced Team Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-6">
              <Users className="w-4 h-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Meet the <span className="text-golden-yellow">Visionaries</span>
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
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card 
                  className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => setSelectedTeamMember(selectedTeamMember === index ? null : index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blockchain-green/5 to-golden-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-8 relative z-10">
                    <div className="aspect-square bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-2xl mb-6 mx-auto w-32 h-32 flex items-center justify-center overflow-hidden">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-blockchain-green font-semibold mb-4">{member.role}</p>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6">{member.description}</p>
                    
                    <div className="flex justify-center space-x-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-golden-yellow">{member.experience}</div>
                        <div className="text-xs text-gray-400">Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-blockchain-green">{member.specialization}</div>
                        <div className="text-xs text-gray-400">Specialization</div>
                      </div>
                    </div>

                    <div className="flex justify-center space-x-3">
                      <Button size="sm" variant="outline" className="p-2 border-white/20" asChild>
                        <Link href={member.linkedin}>
                          <Linkedin className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="p-2 border-white/20" asChild>
                        <Link href={member.twitter || '#'}>
                          <Twitter className="w-4 h-4" />
                        </Link>
                      </Button>
                      {member.github && (
                        <Button size="sm" variant="outline" className="p-2 border-white/20" asChild>
                          <Link href={member.github}>
                            <Github className="w-4 h-4" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    <AnimatePresence>
                      {selectedTeamMember === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-white/10"
                        >
                          <div className="text-left space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-blockchain-green mb-2">Education</h4>
                              <p className="text-xs text-gray-300">{member.education}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-golden-yellow mb-2">Key Achievements</h4>
                              <ul className="space-y-1">
                                {member.achievements.map((achievement, i) => (
                                  <li key={i} className="text-xs text-gray-300 flex items-start">
                                    <div className="w-1 h-1 bg-blockchain-green rounded-full mt-2 mr-2 flex-shrink-0" />
                                    {achievement}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-golden-yellow/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 mb-6">
              <Quote className="w-4 h-4 mr-2" />
              Testimonials
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              What Our <span className="text-blockchain-green">Community</span> Says
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real stories from entrepreneurs and investors who've transformed their futures
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center">
                  <CardContent className="p-12">
                    <div className="flex justify-center mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-golden-yellow fill-current" />
                      ))}
                    </div>
                    
                    <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed font-light">
                      "{testimonials[currentTestimonial].content}"
                    </blockquote>
                    
                    <div className="flex items-center justify-center space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-full flex items-center justify-center overflow-hidden">
                        <img 
                          src={testimonials[currentTestimonial].image} 
                          alt={testimonials[currentTestimonial].name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-white text-lg">{testimonials[currentTestimonial].name}</div>
                        <div className="text-blockchain-green font-medium">{testimonials[currentTestimonial].role}</div>
                        <div className="text-gray-400 text-sm">{testimonials[currentTestimonial].location}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-golden-yellow font-bold text-lg">{testimonials[currentTestimonial].investment}</div>
                        <div className="text-gray-400 text-sm">Investment</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-blockchain-green' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="border-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Timeline Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-6">
              <Calendar className="w-4 h-4 mr-2" />
              Our Journey
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Building the <span className="text-golden-yellow">Future</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Key milestones in our mission to democratize global investment
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col lg:flex-row items-center mb-20 last:mb-0"
              >
                <div className={`flex-1 lg:pr-12 ${index % 2 === 1 ? 'lg:order-2 lg:pl-12 lg:pr-0' : ''}`}>
                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 text-xl px-4 py-2">
                          {milestone.year}
                        </Badge>
                        <div className="text-sm text-blockchain-green font-semibold">{milestone.month}</div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4">{milestone.title}</h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">{milestone.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {milestone.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blockchain-green rounded-full flex-shrink-0" />
                            <span className="text-gray-400 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className={`flex-1 lg:pl-12 mt-8 lg:mt-0 ${index % 2 === 1 ? 'lg:order-1 lg:pr-12 lg:pl-0' : ''}`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-blockchain-green/20 to-golden-yellow/20 rounded-2xl overflow-hidden">
                    <img 
                      src={milestone.image} 
                      alt={milestone.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-blockchain-green/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 mb-6">
              <Trophy className="w-4 h-4 mr-2" />
              Recognition
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Awards & <span className="text-blockchain-green">Achievements</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Industry recognition for our innovative approach to global investment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {awards.map((award, index) => (
              <motion.div
                key={award.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 text-center hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-golden-yellow/20 to-blockchain-green/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Award className="w-8 h-8 text-golden-yellow" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{award.title}</h3>
                    <p className="text-blockchain-green font-semibold mb-2">{award.organization}</p>
                    <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-3">
                      {award.year}
                    </Badge>
                    <p className="text-sm text-gray-300">{award.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-6">
              <Handshake className="w-4 h-4 mr-2" />
              Partners
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted <span className="text-golden-yellow">Partners</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Working with leading organizations to create global impact
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center justify-center"
              >
                <div className="p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-transparent via-golden-yellow/5 to-transparent">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-blockchain-green/20 text-blockchain-green border-blockchain-green/30 mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked <span className="text-blockchain-green">Questions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about investing with BlockVest Social
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 overflow-hidden">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                      {expandedFAQ === index ? (
                        <Minus className="w-5 h-5 text-blockchain-green flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-blockchain-green flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-golden-yellow/20 text-golden-yellow border-golden-yellow/30 mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us
            </Badge>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
              Get In <span className="text-golden-yellow">Touch</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Ready to start your investment journey? Have questions? We'd love to hear from you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-green"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-green"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-green resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-blockchain-green to-emerald-500 hover:from-emerald-500 hover:to-blockchain-green text-white font-bold"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blockchain-green/20 rounded-lg">
                      <Mail className="w-6 h-6 text-blockchain-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Email</h4>
                      <p className="text-gray-300">hello@blockvest.social</p>
                      <p className="text-gray-300">support@blockvest.social</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blockchain-green/20 rounded-lg">
                      <Phone className="w-6 h-6 text-blockchain-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Phone</h4>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                      <p className="text-gray-300">+44 20 7123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blockchain-green/20 rounded-lg">
                      <MapPin className="w-6 h-6 text-blockchain-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Headquarters</h4>
                      <p className="text-gray-300">
                        1 Hacker Way<br />
                        San Francisco, CA 94301<br />
                        United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20">
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold text-white mb-4">Stay Updated</h4>
                  <p className="text-gray-300 mb-6">
                    Get the latest news, updates, and investment opportunities delivered to your inbox.
                  </p>
                  <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blockchain-green"
                      placeholder="Enter your email address"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-golden-yellow to-yellow-500 hover:from-yellow-500 hover:to-golden-yellow text-navy-dark font-bold"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Subscribe to Newsletter
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Social Media */}
              <div>
                <h4 className="text-xl font-bold text-white mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" className="border-white/20" asChild>
                    <Link href="https://twitter.com/blockvest">
                      <Twitter className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20" asChild>
                    <Link href="https://linkedin.com/company/blockvest">
                      <Linkedin className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20" asChild>
                    <Link href="https://facebook.com/blockvest">
                      <Facebook className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20" asChild>
                    <Link href="https://instagram.com/blockvest">
                      <Instagram className="w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blockchain-green/5 via-transparent to-golden-yellow/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-blockchain-green via-emerald-500 to-golden-yellow text-navy-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
              <CardContent className="p-16 text-center relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex justify-center mb-8">
                    <div className="p-4 bg-navy-dark/20 rounded-2xl">
                      <Rocket className="w-16 h-16 text-navy-dark" />
                    </div>
                  </div>
                  
                  <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                    Ready to Make History?
                  </h2>
                  <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
                    Join thousands of investors creating positive change through micro-investments. 
                    Be part of the future of finance and help entrepreneurs worldwide achieve their dreams.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                    <Button
                      size="lg"
                      className="bg-navy-dark hover:bg-navy-dark/90 text-white font-bold text-lg px-10 py-6 rounded-xl shadow-2xl hover:shadow-navy-dark/25 transition-all duration-300 transform hover:scale-105"
                      asChild
                    >
                      <Link href="/explore">
                        <Eye className="w-6 h-6 mr-3" />
                        Explore Opportunities
                        <ArrowRight className="w-6 h-6 ml-3" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-navy-dark text-navy-dark hover:bg-navy-dark hover:text-white font-bold text-lg px-10 py-6 rounded-xl transition-all duration-300"
                      asChild
                    >
                      <Link href="/explore">
                        <Users className="w-6 h-6 mr-3" />
                        Become an Entrepreneur
                      </Link>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="p-6 bg-navy-dark/10 rounded-xl">
                      <div className="text-3xl font-bold mb-2">$50</div>
                      <div className="text-sm opacity-80">Minimum investment</div>
                    </div>
                    <div className="p-6 bg-navy-dark/10 rounded-xl">
                      <div className="text-3xl font-bold mb-2">18.7%</div>
                      <div className="text-sm opacity-80">Average annual return</div>
                    </div>
                    <div className="p-6 bg-navy-dark/10 rounded-xl">
                      <div className="text-3xl font-bold mb-2">45+</div>
                      <div className="text-sm opacity-80">Countries supported</div>
                    </div>
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