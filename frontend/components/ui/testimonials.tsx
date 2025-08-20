'use client';

import React, { useState, useEffect } from 'react';
import { 
  StarIcon,
  QuoteIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/solid';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
  content: string;
  rating: number;
  investmentAmount?: number;
  successStory?: string;
  tags: string[];
}

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Entrepreneur',
      company: 'GreenTech Solutions',
      location: 'San Francisco, CA',
      avatar: '/api/placeholder/80/80',
      content: 'Blockvest Social transformed my business. I was able to secure funding from investors who believed in my vision, not just my credit score. The platform\'s reputation system helped me build trust quickly.',
      rating: 5,
      investmentAmount: 25000,
      successStory: 'Expanded from 5 to 25 employees, increased revenue by 300%',
      tags: ['Business Expansion', 'Green Technology', 'Social Impact']
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Investor',
      company: 'Tech Ventures',
      location: 'New York, NY',
      avatar: '/api/placeholder/80/80',
      content: 'As an investor, I love how transparent and secure the platform is. The AI-powered risk assessment gives me confidence, and I can see the real impact of my investments through social connections.',
      rating: 5,
      investmentAmount: 50000,
      successStory: 'Generated 12% average returns while supporting social causes',
      tags: ['Portfolio Growth', 'Social Investing', 'Risk Management']
    },
    {
      id: '3',
      name: 'Maria Rodriguez',
      role: 'Small Business Owner',
      company: 'Artisan Bakery',
      location: 'Miami, FL',
      avatar: '/api/placeholder/80/80',
      content: 'Traditional banks turned me down, but Blockvest Social gave me a chance. The community support was incredible - my investors became my biggest customers and advocates.',
      rating: 5,
      investmentAmount: 15000,
      successStory: 'Opened second location, hired 8 local employees',
      tags: ['Local Business', 'Community Support', 'Job Creation']
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Student',
      company: 'University of Michigan',
      location: 'Ann Arbor, MI',
      avatar: '/api/placeholder/80/80',
      content: 'I used Blockvest Social to fund my education when traditional loans weren\'t available. The flexible repayment terms and supportive community made all the difference.',
      rating: 5,
      investmentAmount: 8000,
      successStory: 'Graduated with honors, secured dream job at top tech company',
      tags: ['Education Funding', 'Student Success', 'Career Growth']
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Retired Teacher',
      company: 'Community Volunteer',
      location: 'Portland, OR',
      avatar: '/api/placeholder/80/80',
      content: 'I wanted to make a difference in retirement. Blockvest Social lets me invest in people and causes I care about while earning competitive returns. It\'s investing with purpose.',
      rating: 5,
      investmentAmount: 35000,
      successStory: 'Funded 12 local projects, average 9% returns',
      tags: ['Retirement Income', 'Social Impact', 'Local Community']
    },
    {
      id: '6',
      name: 'Ahmed Hassan',
      role: 'Immigrant Entrepreneur',
      company: 'Global Foods Market',
      location: 'Chicago, IL',
      avatar: '/api/placeholder/80/80',
      content: 'Coming to America with no credit history was challenging. Blockvest Social\'s reputation system and community connections helped me build trust and access capital.',
      rating: 5,
      investmentAmount: 30000,
      successStory: 'Built successful import business, employs 15 people',
      tags: ['Immigrant Success', 'International Business', 'Job Creation']
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
    setIsAutoPlaying(false);
  };

  const previousTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Success Stories from Our Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real people, real results. Discover how Blockvest Social is transforming 
            lives and businesses around the world.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-12">
          {/* Quote Icon */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <QuoteIcon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12 shadow-xl border border-blue-100">
            {/* Rating */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {renderStars(currentTestimonial.rating)}
              </div>
            </div>

            {/* Content */}
            <blockquote className="text-center mb-8">
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed italic">
                "{currentTestimonial.content}"
              </p>
            </blockquote>

            {/* Author Info */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="text-left">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {currentTestimonial.name}
                  </h4>
                  <p className="text-gray-600">
                    {currentTestimonial.role} at {currentTestimonial.company}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentTestimonial.location}
                  </p>
                </div>
              </div>

              {/* Success Metrics */}
              {currentTestimonial.investmentAmount && (
                <div className="bg-white rounded-lg p-4 mb-4 inline-block">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${currentTestimonial.investmentAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Investment Amount</div>
                  </div>
                </div>
              )}

              {/* Success Story */}
              {currentTestimonial.successStory && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-medium text-center">
                    🎉 {currentTestimonial.successStory}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {currentTestimonial.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={previousTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mb-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Toggle */}
        <div className="text-center mb-12">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isAutoPlaying
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Auto-rotation
          </button>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Community Impact by the Numbers
            </h3>
            <p className="text-xl text-blue-100">
              See the real difference our platform is making
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">$25M+</div>
              <div className="text-blue-100">Total Invested</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Countries</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Write Your Success Story?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already building their future with 
              Blockvest Social. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                Get Started Now
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                Read More Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
