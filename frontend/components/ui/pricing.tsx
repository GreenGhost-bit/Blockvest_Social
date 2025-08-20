'use client';

import React, { useState } from 'react';
import { 
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  exclusions: string[];
  popular?: boolean;
  color: string;
  icon: React.ComponentType<any>;
}

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      billingCycle: 'forever',
      features: [
        'Basic investment browsing',
        'Limited profile features',
        'Community access',
        'Basic notifications',
        'Mobile app access',
        'Email support'
      ],
      exclusions: [
        'Advanced analytics',
        'Priority support',
        'Custom investment terms',
        'API access',
        'Advanced risk assessment',
        'Portfolio management tools'
      ],
      color: 'gray',
      icon: StarIcon
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'Great for individual investors',
      price: billingCycle === 'monthly' ? 9 : 90,
      billingCycle: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        'Everything in Free',
        'Advanced investment tools',
        'Portfolio tracking',
        'Risk assessment reports',
        'Priority notifications',
        'Community features',
        'Basic analytics',
        'Email & chat support'
      ],
      exclusions: [
        'Custom investment terms',
        'API access',
        'Advanced portfolio management',
        'Dedicated account manager',
        'Custom reporting',
        'White-label solutions'
      ],
      color: 'blue',
      icon: ShieldCheckIcon
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best for active investors',
      price: billingCycle === 'monthly' ? 29 : 290,
      billingCycle: billingCycle === 'monthly' ? 'month' : 'year',
      popular: true,
      features: [
        'Everything in Basic',
        'Advanced portfolio management',
        'Custom investment terms',
        'API access',
        'Advanced analytics',
        'Risk modeling tools',
        'Automated investing',
        'Priority support',
        'Custom reporting',
        'Integration capabilities'
      ],
      exclusions: [
        'Dedicated account manager',
        'White-label solutions',
        'Custom compliance features',
        'Enterprise security features',
        'Multi-entity management',
        'Advanced compliance tools'
      ],
      color: 'purple',
      icon: ChartBarIcon
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For institutions and large teams',
      price: billingCycle === 'monthly' ? 99 : 990,
      billingCycle: billingCycle === 'monthly' ? 'month' : 'year',
      features: [
        'Everything in Pro',
        'Dedicated account manager',
        'White-label solutions',
        'Custom compliance features',
        'Enterprise security',
        'Multi-entity management',
        'Advanced compliance tools',
        'Custom integrations',
        'SLA guarantees',
        '24/7 phone support',
        'On-site training',
        'Custom development'
      ],
      exclusions: [],
      color: 'indigo',
      icon: GlobeAltIcon
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      gray: 'from-gray-500 to-gray-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-500 to-gray-600';
  };

  const getBorderColor = (color: string) => {
    const colorMap = {
      gray: 'border-gray-200',
      blue: 'border-blue-200',
      purple: 'border-purple-200',
      indigo: 'border-indigo-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'border-gray-200';
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      gray: 'text-gray-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleGetStarted = (planId: string) => {
    // Handle plan selection and redirect to signup
    console.log('Selected plan:', planId);
  };

  const savings = billingCycle === 'yearly' ? 17 : 0;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your investment goals. All plans include 
            our core features with no hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg p-1 shadow-lg border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                {billingCycle === 'yearly' && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Save 17%
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                plan.popular
                  ? 'border-purple-300 ring-2 ring-purple-200'
                  : getBorderColor(plan.color)
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                    <StarIcon className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg mb-4">
                  <plan.icon className={`h-6 w-6 ${getIconColor(plan.color)}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 ml-1">
                        /{plan.billingCycle}
                      </span>
                    )}
                  </div>
                  {plan.price === 0 && (
                    <p className="text-sm text-gray-500 mt-1">No credit card required</p>
                  )}
                </div>
              </div>

              {/* Plan Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Exclusions */}
                {plan.exclusions.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      Not Included
                    </p>
                    <ul className="space-y-2">
                      {plan.exclusions.map((exclusion, index) => (
                        <li key={index} className="flex items-start">
                          <XMarkIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-500">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => handleGetStarted(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Savings Notice */}
        {billingCycle === 'yearly' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full">
              <span className="font-medium">
                Save ${savings} annually with yearly billing
              </span>
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Feature Comparison
            </h3>
            <p className="text-xl text-gray-600">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Basic</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Investment Browsing</td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Portfolio Tracking</td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Advanced Analytics</td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">API Access</td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-gray-900">Dedicated Support</td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change plans anytime?
              </h4>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Is there a setup fee?
              </h4>
              <p className="text-gray-600">
                No setup fees. You only pay for the plan you choose, with no hidden costs.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                What payment methods do you accept?
              </h4>
              <p className="text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers for annual plans.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer refunds?
              </h4>
              <p className="text-gray-600">
                We offer a 30-day money-back guarantee for all paid plans.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our team is here to help you choose the right plan for your needs. 
              Contact us for personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Contact Sales
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
