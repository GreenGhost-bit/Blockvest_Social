'use client';

import React from 'react';
import { 
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  LightningBoltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  details: string[];
  color: string;
}

const Features: React.FC = () => {
  const features: Feature[] = [
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Transparent',
      description: 'Bank-level security with blockchain transparency',
      details: [
        'End-to-end encryption for all transactions',
        'Smart contract verification on Algorand',
        'Real-time audit trails',
        'Regulatory compliance built-in'
      ],
      color: 'blue'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Access',
      description: 'Connect with users worldwide without borders',
      details: [
        'Multi-currency support',
        'Localized interfaces',
        'Cross-border transactions',
        'Global community network'
      ],
      color: 'green'
    },
    {
      icon: HeartIcon,
      title: 'Social Impact',
      description: 'Create meaningful financial relationships',
      details: [
        'Community-driven lending',
        'Social reputation building',
        'Impact investment tracking',
        'Charitable giving integration'
      ],
      color: 'pink'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Investing',
      description: 'AI-powered risk assessment and analytics',
      details: [
        'Machine learning risk models',
        'Real-time portfolio analytics',
        'Predictive market insights',
        'Automated rebalancing'
      ],
      color: 'purple'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Network',
      description: 'Build connections and grow your network',
      details: [
        'Social profile management',
        'Connection recommendations',
        'Community events',
        'Mentorship programs'
      ],
      color: 'indigo'
    },
    {
      icon: CogIcon,
      title: 'Advanced Tools',
      description: 'Professional-grade investment tools',
      details: [
        'Portfolio management',
        'Risk assessment tools',
        'Performance tracking',
        'Tax reporting'
      ],
      color: 'yellow'
    },
    {
      icon: LightningBoltIcon,
      title: 'Fast & Efficient',
      description: 'Lightning-fast transactions and processing',
      details: [
        'Sub-second transaction finality',
        'Low transaction fees',
        'Scalable infrastructure',
        '24/7 availability'
      ],
      color: 'orange'
    },
    {
      icon: LockClosedIcon,
      title: 'Privacy First',
      description: 'Your data stays private and secure',
      details: [
        'Zero-knowledge proofs',
        'Selective disclosure',
        'Data encryption at rest',
        'Privacy controls'
      ],
      color: 'red'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      pink: 'from-pink-500 to-pink-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
      yellow: 'from-yellow-500 to-yellow-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      pink: 'text-pink-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600',
      red: 'text-red-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getBgColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      pink: 'bg-pink-50',
      purple: 'bg-purple-50',
      indigo: 'bg-indigo-50',
      yellow: 'bg-yellow-50',
      orange: 'bg-orange-50',
      red: 'bg-red-50'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50';
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Platform Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the powerful tools and capabilities that make Blockvest Social 
            the leading platform for decentralized social investing.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Feature Icon */}
              <div className={`p-6 ${getBgColor(feature.color)} rounded-t-xl`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${getColorClasses(feature.color)} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Feature Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature Details */}
                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start space-x-2">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${getBgColor(feature.color)}`}></div>
                      <span className="text-sm text-gray-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Experience the Platform
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                See how our features work together to create a seamless investing experience. 
                From risk assessment to portfolio management, every tool is designed with you in mind.
              </p>

              {/* Feature Highlights */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Security First
                    </h4>
                    <p className="text-gray-600">
                      Every transaction is secured by Algorand's consensus mechanism and verified by smart contracts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <GlobeAltIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Global Network
                    </h4>
                    <p className="text-gray-600">
                      Connect with investors and borrowers from around the world, breaking down geographical barriers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Smart Analytics
                    </h4>
                    <p className="text-gray-600">
                      AI-powered insights help you make informed investment decisions and manage risk effectively.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  Try Demo
                </button>
              </div>
            </div>

            {/* Interactive Demo Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="h-10 w-10" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Live Demo</h4>
                  <p className="text-blue-100">
                    Interactive platform demonstration
                  </p>
                </div>

                {/* Mock Dashboard Elements */}
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Portfolio Value</span>
                      <span className="text-2xl font-bold">$12,450</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-2xl font-bold text-green-400">Low</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Investments</span>
                      <span className="text-2xl font-bold">8</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div key={item} className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 transform rotate-12">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-gray-700">Live</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 transform -rotate-12">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">875</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Explore All Features?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Sign up for a free account and experience the full power of our platform. 
              No commitment required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
