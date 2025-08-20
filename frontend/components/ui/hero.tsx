'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface HeroProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted, onLearnMore }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Transparent',
      description: 'Built on Algorand blockchain with smart contracts'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Access',
      description: 'Connect with borrowers and investors worldwide'
    },
    {
      icon: HeartIcon,
      title: 'Social Impact',
      description: 'Create meaningful financial relationships'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Investing',
      description: 'AI-powered risk assessment and reputation scoring'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '$2.5M+', label: 'Total Invested' },
    { number: '98%', label: 'Success Rate' },
    { number: '150+', label: 'Countries' }
  ];

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    }
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <ShieldCheckIcon className="h-4 w-4 mr-2" />
              Trusted by 10,000+ users worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Decentralized
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Social Investing
              </span>
              on Algorand
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Connect with borrowers and investors globally through our Web3 platform. 
              Build reputation, access capital, and create meaningful financial relationships 
              without traditional credit barriers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
              
              <button
                onClick={handleLearnMore}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-4 w-4 text-green-500 mr-2" />
                <span>Bank-level Security</span>
              </div>
              <div className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 text-blue-500 mr-2" />
                <span>Regulated Platform</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Main Hero Image/Video */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Live Investment Dashboard</h3>
                <p className="text-blue-100 text-sm">
                  Real-time portfolio tracking and social connections
                </p>
              </div>
              
              {/* Mock Investment Cards */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-sm">S</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sarah's Business</p>
                      <p className="text-xs text-gray-500">$2,500 • 8.5% APR</p>
                    </div>
                  </div>
                  <span className="text-green-600 text-sm font-medium">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Mike's Equipment</p>
                      <p className="text-xs text-gray-500">$15,000 • 12.0% APR</p>
                    </div>
                  </div>
                  <span className="text-yellow-600 text-sm font-medium">Pending</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-12">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Live</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 transform rotate-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">875</div>
                <div className="text-xs text-gray-500">Reputation Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Blockvest Social?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the power of blockchain technology with social connections 
              to create a new paradigm in decentralized finance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of users already building their financial future
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join our community of investors and borrowers. Create your profile, 
              connect with others, and start building your financial future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Create Account
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Hero;
