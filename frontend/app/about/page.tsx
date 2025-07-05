'use client';

import React from 'react';
import Link from 'next/link';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Blockvest Social</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Empowering financial inclusion through blockchain technology and social investment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              Blockvest Social is a revolutionary platform that bridges the gap between traditional finance 
              and underserved communities. We believe that everyone deserves access to financial opportunities, 
              regardless of their formal credit history.
            </p>
            <p className="text-gray-600 mb-4">
              By leveraging the power of blockchain technology, specifically the Algorand network, we create 
              a transparent, secure, and efficient environment where investors can support individuals who 
              need funding for their goals and dreams.
            </p>
            <p className="text-gray-600">
              Our platform is inspired by RangDe's social impact model but built entirely on Web3 
              infrastructure, ensuring decentralization, transparency, and trustless transactions.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Decentralized investment platform on Algorand</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Web2-style user interface for easy adoption</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Smart contract-based lending and investment</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Reputation system for trust building</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Transparent transaction history</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <span className="text-gray-600">Community governance mechanisms</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Borrowers</h3>
              <p className="text-gray-600">
                Create your profile, describe your funding needs, and connect with investors who believe in your potential.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Investors</h3>
              <p className="text-gray-600">
                Browse investment opportunities, evaluate borrower profiles, and fund projects that align with your values.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Contracts</h3>
              <p className="text-gray-600">
                All transactions are secured by smart contracts on Algorand, ensuring transparency and automatic execution.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Algorand?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Fast Transactions</h4>
                  <p className="text-gray-600">Algorand processes transactions in seconds, not minutes or hours.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Low Fees</h4>
                  <p className="text-gray-600">Minimal transaction costs make micro-investments economically viable.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Carbon Negative</h4>
                  <p className="text-gray-600">Algorand is carbon negative, aligning with our sustainability values.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Secure</h4>
                  <p className="text-gray-600">Built-in security features protect all users and their investments.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-gray-600 mb-4">
              We envision a world where financial inclusion is not just an aspiration but a reality. 
              Through blockchain technology, we aim to create a global network of trust and opportunity.
            </p>
            <p className="text-gray-600 mb-4">
              Our platform will enable millions of people worldwide to access funding for education, 
              healthcare, business ventures, and personal development, regardless of their traditional 
              credit history.
            </p>
            <p className="text-gray-600">
              By combining the transparency of blockchain with the human element of social impact, 
              we're building a more equitable financial future for everyone.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Make an Impact?</h2>
          <p className="text-lg mb-6">
            Join thousands of investors and borrowers who are already creating positive change through Blockvest Social.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/explore"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start Investing
            </Link>
            <Link
              href="/investments"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Request Funding
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my money safe?</h3>
              <p className="text-gray-600">
                Yes, all funds are secured by smart contracts on the Algorand blockchain. 
                Transactions are transparent and cannot be altered once confirmed.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I get started?</h3>
              <p className="text-gray-600">
                Simply connect your Algorand wallet, complete your profile, and start exploring 
                investment opportunities or create your own funding request.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are the fees?</h3>
              <p className="text-gray-600">
                We charge minimal platform fees to cover operational costs. 
                All fees are transparent and displayed before any transaction.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I invest any amount?</h3>
              <p className="text-gray-600">
                Yes, you can start with small amounts. Our platform supports micro-investments, 
                making it accessible to investors with different budget levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;