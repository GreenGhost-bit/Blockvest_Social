'use client';

import React, { useState } from 'react';
import { 
  ChevronDownIcon,
  ChevronUpIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  relatedQuestions?: string[];
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How does Blockvest Social work?',
      answer: 'Blockvest Social is a decentralized social investing platform built on the Algorand blockchain. Users can create investment requests, browse opportunities, and connect with investors or borrowers. The platform uses smart contracts to ensure transparency and security in all transactions. Users build reputation through successful investments and repayments, which helps them access better terms and larger amounts.',
      category: 'general',
      tags: ['platform', 'how-it-works', 'blockchain'],
      relatedQuestions: ['What is social investing?', 'How do smart contracts work?']
    },
    {
      id: '2',
      question: 'What is the minimum investment amount?',
      answer: 'The minimum investment amount varies based on the investment request and borrower requirements. Generally, investments start from $100, but some borrowers may set higher minimums. The platform also offers fractional investing, allowing you to invest smaller amounts in larger opportunities.',
      category: 'investing',
      tags: ['minimum-amount', 'fractional-investing', 'requirements'],
      relatedQuestions: ['What are the investment fees?', 'How do I start investing?']
    },
    {
      id: '3',
      question: 'How is my money protected?',
      answer: 'Your investments are protected through multiple layers of security: 1) Smart contracts on the Algorand blockchain ensure transparent and immutable transaction records, 2) Our reputation system helps you assess borrower risk, 3) AI-powered risk assessment provides additional insights, 4) All transactions are verified on-chain, and 5) We maintain regulatory compliance and insurance coverage.',
      category: 'security',
      tags: ['security', 'protection', 'smart-contracts', 'insurance'],
      relatedQuestions: ['Are smart contracts safe?', 'What happens if a borrower defaults?']
    },
    {
      id: '4',
      question: 'How do I build my reputation score?',
      answer: 'Your reputation score is built through various factors: successful repayments, on-time payments, community engagement, verification status, and social connections. Each successful investment and repayment increases your score, while defaults or late payments decrease it. You can also improve your score by completing KYC verification, connecting with other users, and participating in the community.',
      category: 'reputation',
      tags: ['reputation', 'scoring', 'verification', 'community'],
      relatedQuestions: ['What is KYC verification?', 'How long does it take to build reputation?']
    },
    {
      id: '5',
      question: 'What happens if a borrower defaults?',
      answer: 'In case of default, our platform has several protective measures: 1) We work with borrowers to find alternative repayment solutions, 2) Our risk assessment system helps minimize default risk, 3) Legal proceedings can be initiated if necessary, 4) Default information is recorded on the blockchain for transparency, and 5) We offer insurance options for additional protection.',
      category: 'investing',
      tags: ['default', 'risk-management', 'insurance', 'legal'],
      relatedQuestions: ['How do you assess borrower risk?', 'What insurance options are available?']
    },
    {
      id: '6',
      question: 'How do I connect my Algorand wallet?',
      answer: 'Connecting your Algorand wallet is simple: 1) Click the "Connect Wallet" button in the header, 2) Choose your preferred wallet (MyAlgo, AlgoSigner, or Pera Wallet), 3) Approve the connection in your wallet, 4) Verify your wallet address, and 5) Start using the platform. We support all major Algorand wallets and ensure secure connections.',
      category: 'technical',
      tags: ['wallet', 'algorand', 'connection', 'security'],
      relatedQuestions: ['Which wallets are supported?', 'Is wallet connection safe?']
    },
    {
      id: '7',
      question: 'What are the platform fees?',
      answer: 'Our platform operates on a transparent fee structure: 1) No fees for basic account usage, 2) Small transaction fees (0.5-1%) for successful investments, 3) No fees for borrowers on successful repayments, 4) Premium features available through subscription plans, and 5) All fees are clearly displayed before transactions.',
      category: 'fees',
      tags: ['fees', 'pricing', 'transactions', 'subscription'],
      relatedQuestions: ['Are there hidden fees?', 'What premium features are available?']
    },
    {
      id: '8',
      question: 'How do I verify my identity?',
      answer: 'Identity verification involves several steps: 1) Complete your profile with accurate information, 2) Upload government-issued ID documents, 3) Provide proof of address, 4) Complete video verification if required, 5) Wait for review (usually 24-48 hours). Verification levels determine your investment limits and platform access.',
      category: 'verification',
      tags: ['kyc', 'identity', 'verification', 'documents'],
      relatedQuestions: ['What documents do I need?', 'How long does verification take?']
    },
    {
      id: '9',
      question: 'Can I invest internationally?',
      answer: 'Yes, Blockvest Social supports international investing! Our platform operates globally, allowing you to invest in borrowers from different countries. We handle currency conversions automatically, comply with international regulations, and provide localized support. However, some restrictions may apply based on your location and local regulations.',
      category: 'international',
      tags: ['international', 'global', 'currency', 'regulations'],
      relatedQuestions: ['What currencies are supported?', 'Are there country restrictions?']
    },
    {
      id: '10',
      question: 'How do I track my investments?',
      answer: 'Investment tracking is available through multiple channels: 1) Real-time dashboard showing all active investments, 2) Portfolio analytics with performance metrics, 3) Mobile app for on-the-go monitoring, 4) Email notifications for important updates, 5) Blockchain explorer for transaction verification. Premium users get access to advanced analytics and reporting tools.',
      category: 'tracking',
      tags: ['tracking', 'portfolio', 'analytics', 'notifications'],
      relatedQuestions: ['What analytics are available?', 'How do I set up notifications?']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon, count: faqData.length },
    { id: 'general', name: 'General', icon: LightBulbIcon, count: faqData.filter(item => item.category === 'general').length },
    { id: 'investing', name: 'Investing', icon: CurrencyDollarIcon, count: faqData.filter(item => item.category === 'investing').length },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon, count: faqData.filter(item => item.category === 'security').length },
    { id: 'reputation', name: 'Reputation', icon: LightBulbIcon, count: faqData.filter(item => item.category === 'reputation').length },
    { id: 'technical', name: 'Technical', icon: QuestionMarkCircleIcon, count: faqData.filter(item => item.category === 'technical').length },
    { id: 'fees', name: 'Fees & Pricing', icon: CurrencyDollarIcon, count: faqData.filter(item => item.category === 'fees').length },
    { id: 'verification', name: 'Verification', icon: ShieldCheckIcon, count: faqData.filter(item => item.category === 'verification').length },
    { id: 'international', name: 'International', icon: LightBulbIcon, count: faqData.filter(item => item.category === 'international').length },
    { id: 'tracking', name: 'Tracking', icon: QuestionMarkCircleIcon, count: faqData.filter(item => item.category === 'tracking').length }
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || QuestionMarkCircleIcon;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'General';
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our platform, investing process, 
            security measures, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <QuestionMarkCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activeCategory === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12">
              <QuestionMarkCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No questions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-6 py-5 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {item.question}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {getCategoryName(item.category)}
                          </span>
                          <div className="flex space-x-1">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{item.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {openItems.has(item.id) ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Answer Content */}
                {openItems.has(item.id) && (
                  <div className="px-6 pb-5 border-t border-gray-100">
                    <div className="pt-4">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {item.answer}
                      </p>
                      
                      {/* Related Questions */}
                      {item.relatedQuestions && item.relatedQuestions.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Related Questions:
                          </h4>
                          <ul className="space-y-1">
                            {item.relatedQuestions.map((relatedQuestion, index) => (
                              <li key={index} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">
                                • {relatedQuestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help. 
              Contact us for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <QuestionMarkCircleIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Help Center
              </h4>
              <p className="text-gray-600 mb-4">
                Comprehensive guides and tutorials
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Visit Help Center →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <LightBulbIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Getting Started
              </h4>
              <p className="text-gray-600 mb-4">
                Step-by-step setup guide
              </p>
              <button className="text-green-600 hover:text-green-700 font-medium">
                Start Guide →
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <ShieldCheckIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Security & Privacy
              </h4>
              <p className="text-gray-600 mb-4">
                Learn about our security measures
              </p>
              <button className="text-purple-600 hover:text-purple-700 font-medium">
                Security Info →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
