"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Vote, Clock, Users, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

const proposals = [
  {
    id: 1,
    title: "Reduce Platform Fees for Small Investments",
    description:
      "Proposal to reduce platform fees from 2% to 1% for investments under $100 to encourage micro-investing.",
    status: "Active",
    votesFor: 1247,
    votesAgainst: 342,
    totalVotes: 1589,
    quorum: 2000,
    timeLeft: "3 days",
    proposer: "Community DAO",
    category: "Platform",
    votingPower: 150,
    userVoted: false,
  },
  {
    id: 2,
    title: "Add Carbon Credit Marketplace",
    description:
      "Integrate a carbon credit marketplace where entrepreneurs can sell verified carbon offsets to investors.",
    status: "Active",
    votesFor: 892,
    votesAgainst: 156,
    totalVotes: 1048,
    quorum: 1500,
    timeLeft: "5 days",
    proposer: "Green Initiative Team",
    category: "Feature",
    votingPower: 150,
    userVoted: true,
    userVote: "for",
  },
  {
    id: 3,
    title: "Implement Reputation-Based Lending Rates",
    description:
      "Adjust lending rates based on borrower reputation scores to incentivize good behavior and reduce risk.",
    status: "Passed",
    votesFor: 2156,
    votesAgainst: 445,
    totalVotes: 2601,
    quorum: 2000,
    timeLeft: "Completed",
    proposer: "Risk Management Committee",
    category: "Policy",
    votingPower: 150,
    userVoted: true,
    userVote: "for",
  },
  {
    id: 4,
    title: "Increase Maximum Investment Limit",
    description: "Raise the maximum individual investment limit from $1,000 to $2,500 per opportunity.",
    status: "Failed",
    votesFor: 567,
    votesAgainst: 1834,
    totalVotes: 2401,
    quorum: 2000,
    timeLeft: "Completed",
    proposer: "Investment Committee",
    category: "Policy",
    votingPower: 150,
    userVoted: true,
    userVote: "against",
  },
]

const votingStats = [
  { label: "Your Voting Power", value: "150", icon: Vote },
  { label: "Proposals Voted", value: "12", icon: CheckCircle },
  { label: "Governance Tokens", value: "1,250", icon: TrendingUp },
  { label: "Community Rank", value: "#47", icon: Users },
]

export default function GovernancePage() {
  const [selectedProposal, setSelectedProposal] = useState<(typeof proposals)[0] | null>(null)
  const [voteChoice, setVoteChoice] = useState("")

  const handleVote = () => {
    if (selectedProposal && voteChoice) {
      // Simulate voting
      console.log(`Voted ${voteChoice} on proposal ${selectedProposal.id}`)
    }
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">Governance Dashboard</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Participate in platform governance and shape the future of Blockvest Social
          </p>
        </motion.div>

        {/* Voting Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {votingStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-light-bg">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 text-blockchain-green mx-auto mb-4" />
                    <div className="text-3xl font-bold text-navy-dark mb-2">{stat.value}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Active Proposals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-light-bg">
            <CardHeader>
              <CardTitle className="text-navy-dark flex items-center">
                <Vote className="w-6 h-6 mr-2 text-blockchain-green" />
                Governance Proposals
              </CardTitle>
              <CardDescription>Vote on proposals that shape the platform's future</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {proposals.map((proposal, index) => {
                  const forPercentage = (proposal.votesFor / proposal.totalVotes) * 100
                  const againstPercentage = (proposal.votesAgainst / proposal.totalVotes) * 100
                  const quorumPercentage = (proposal.totalVotes / proposal.quorum) * 100

                  return (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-navy-dark text-lg">{proposal.title}</h3>
                            <Badge
                              className={
                                proposal.status === "Active"
                                  ? "bg-blockchain-green/20 text-blockchain-green"
                                  : proposal.status === "Passed"
                                    ? "bg-green-100 text-green-800"
                                    : proposal.status === "Failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }
                            >
                              {proposal.status === "Active" && <AlertCircle className="w-3 h-3 mr-1" />}
                              {proposal.status === "Passed" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {proposal.status === "Failed" && <XCircle className="w-3 h-3 mr-1" />}
                              {proposal.status}
                            </Badge>
                            <Badge variant="outline" className="text-blockchain-green border-blockchain-green">
                              {proposal.category}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-4">{proposal.description}</p>
                          <div className="text-sm text-gray-500 mb-4">Proposed by: {proposal.proposer}</div>
                        </div>
                      </div>

                      {/* Voting Results */}
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">For: {proposal.votesFor.toLocaleString()}</span>
                          <span className="text-gray-600">Against: {proposal.votesAgainst.toLocaleString()}</span>
                        </div>

                        <div className="relative">
                          <div className="flex h-4 rounded-full overflow-hidden bg-gray-200">
                            <div className="bg-blockchain-green" style={{ width: `${forPercentage}%` }} />
                            <div className="bg-red-400" style={{ width: `${againstPercentage}%` }} />
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-blockchain-green">{forPercentage.toFixed(1)}% For</span>
                            <span className="text-red-500">{againstPercentage.toFixed(1)}% Against</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quorum Progress</span>
                            <span className="text-gray-600">
                              {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()}
                            </span>
                          </div>
                          <Progress value={quorumPercentage} className="h-2" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="text-sm">{proposal.timeLeft}</span>
                          </div>
                          {proposal.userVoted && (
                            <Badge className="bg-golden-yellow/20 text-golden-yellow">Voted: {proposal.userVote}</Badge>
                          )}
                        </div>

                        {proposal.status === "Active" && !proposal.userVoted && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="bg-blockchain-green hover:bg-blockchain-green/90 text-white"
                                onClick={() => setSelectedProposal(proposal)}
                              >
                                <Vote className="w-4 h-4 mr-2" />
                                Vote Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-light-bg">
                              <DialogHeader>
                                <DialogTitle className="text-navy-dark">Vote on Proposal</DialogTitle>
                                <DialogDescription className="text-navy-dark/70">
                                  {selectedProposal?.title}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Your voting power:{" "}
                                    <span className="font-semibold">{proposal.votingPower} votes</span>
                                  </p>
                                  <RadioGroup value={voteChoice} onValueChange={setVoteChoice}>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="for" id="for" />
                                      <Label htmlFor="for" className="text-navy-dark">
                                        Vote For
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="against" id="against" />
                                      <Label htmlFor="against" className="text-navy-dark">
                                        Vote Against
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="abstain" id="abstain" />
                                      <Label htmlFor="abstain" className="text-navy-dark">
                                        Abstain
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>
                                <Button
                                  className="w-full bg-blockchain-green hover:bg-blockchain-green/90 text-white"
                                  onClick={handleVote}
                                  disabled={!voteChoice}
                                >
                                  <Vote className="w-4 h-4 mr-2" />
                                  Submit Vote
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Governance Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blockchain-green to-golden-yellow text-navy-dark">
            <CardContent className="p-8 text-center">
              <h2 className="font-heading text-3xl font-bold mb-4">Shape the Future of Micro-Investment</h2>
              <p className="text-lg mb-6 opacity-90">
                Your voice matters. Participate in governance to help build a more inclusive financial ecosystem.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold mb-2">2,450+</div>
                  <div className="text-sm opacity-90">Active Voters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">47</div>
                  <div className="text-sm opacity-90">Proposals Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2">94%</div>
                  <div className="text-sm opacity-90">Implementation Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
