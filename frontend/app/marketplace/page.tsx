'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';

interface MarketplaceItem {
  id: string;
  type: 'investment' | 'service' | 'product';
  title: string;
  description: string;
  price: number;
  currency: string;
  seller: {
    name: string;
    reputation: number;
    verified: boolean;
    location: string;
  };
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
  createdAt: string;
  status: 'active' | 'sold' | 'expired';
  features: string[];
}

const MarketplacePage: React.FC = () => {
  const { isConnected } = useWallet();
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  useEffect(() => {
    if (isConnected) {
      fetchMarketplaceItems();
    }
  }, [isConnected, selectedCategory, sortBy, priceRange]);

  const fetchMarketplaceItems = async () => {
    try {
      setLoading(true);
      
      // Check cache first
      const cacheKey = `marketplace_${selectedCategory}_${sortBy}_${priceRange.min}_${priceRange.max}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      
      // Use cached data if it's less than 5 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
        const cachedItems = JSON.parse(cachedData);
        setMarketplaceItems(cachedItems);
        setLoading(false);
        return;
      }
      
      // Mock marketplace data - replace with actual API call
      const mockItems: MarketplaceItem[] = [
        {
          id: '1',
          type: 'investment',
          title: 'Real Estate Investment Opportunity',
          description: 'High-yield real estate investment in downtown commercial property. Expected ROI of 12-15% annually.',
          price: 50000,
          currency: 'USD',
          seller: {
            name: 'Real Estate Partners LLC',
            reputation: 95,
            verified: true,
            location: 'New York, NY'
          },
          category: 'real-estate',
          tags: ['real-estate', 'commercial', 'high-yield'],
          rating: 4.8,
          reviewCount: 24,
          imageUrl: '/images/real-estate.jpg',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['12-15% ROI', 'Prime Location', 'Professional Management']
        },
        {
          id: '2',
          type: 'service',
          title: 'Investment Advisory Services',
          description: 'Professional investment advisory services for portfolio optimization and risk management.',
          price: 2000,
          currency: 'USD',
          seller: {
            name: 'Financial Advisors Pro',
            reputation: 88,
            verified: true,
            location: 'San Francisco, CA'
          },
          category: 'services',
          tags: ['advisory', 'portfolio', 'consulting'],
          rating: 4.6,
          reviewCount: 18,
          imageUrl: '/images/advisory.jpg',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['Portfolio Analysis', 'Risk Assessment', 'Monthly Reports']
        },
        {
          id: '3',
          type: 'product',
          title: 'Investment Analytics Software',
          description: 'Advanced analytics software for investment tracking and performance analysis.',
          price: 500,
          currency: 'USD',
          seller: {
            name: 'Tech Solutions Inc',
            reputation: 92,
            verified: true,
            location: 'Austin, TX'
          },
          category: 'software',
          tags: ['software', 'analytics', 'tracking'],
          rating: 4.9,
          reviewCount: 31,
          imageUrl: '/images/software.jpg',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['Real-time Analytics', 'Custom Dashboards', 'API Integration']
        },
        {
          id: '4',
          type: 'investment',
          title: 'Startup Equity Investment',
          description: 'Early-stage startup equity investment in fintech company with high growth potential.',
          price: 25000,
          currency: 'USD',
          seller: {
            name: 'Venture Capital Partners',
            reputation: 90,
            verified: true,
            location: 'Boston, MA'
          },
          category: 'startup',
          tags: ['startup', 'equity', 'fintech'],
          rating: 4.7,
          reviewCount: 15,
          imageUrl: '/images/startup.jpg',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['High Growth Potential', 'Equity Stake', 'Board Representation']
        },
        {
          id: '5',
          type: 'service',
          title: 'Tax Optimization Services',
          description: 'Professional tax optimization services for investment portfolios and business structures.',
          price: 1500,
          currency: 'USD',
          seller: {
            name: 'Tax Experts Group',
            reputation: 85,
            verified: true,
            location: 'Chicago, IL'
          },
          category: 'services',
          tags: ['tax', 'optimization', 'compliance'],
          rating: 4.5,
          reviewCount: 22,
          imageUrl: '/images/tax.jpg',
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['Tax Planning', 'Compliance Review', 'Annual Filing']
        },
        {
          id: '6',
          type: 'product',
          title: 'Risk Assessment Toolkit',
          description: 'Comprehensive risk assessment toolkit for investment evaluation and due diligence.',
          price: 800,
          currency: 'USD',
          seller: {
            name: 'Risk Management Solutions',
            reputation: 87,
            verified: true,
            location: 'Denver, CO'
          },
          category: 'software',
          tags: ['risk', 'assessment', 'toolkit'],
          rating: 4.4,
          reviewCount: 19,
          imageUrl: '/images/risk.jpg',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          features: ['Risk Models', 'Scenario Analysis', 'Reporting Tools']
        }
      ];
      
      // Validate and sanitize data
      const validatedItems = mockItems.map(item => ({
        ...item,
        id: item.id.trim(),
        type: ['investment', 'service', 'product'].includes(item.type)
          ? item.type
          : 'product' as MarketplaceItem['type'],
        title: item.title.trim(),
        description: item.description.trim(),
        price: Math.max(0, item.price),
        currency: item.currency.trim().toUpperCase(),
        seller: {
          ...item.seller,
          name: item.seller.name.trim(),
          reputation: Math.max(0, Math.min(100, item.seller.reputation)),
          verified: Boolean(item.seller.verified),
          location: item.seller.location.trim()
        },
        category: item.category.trim(),
        tags: item.tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
        rating: Math.max(0, Math.min(5, item.rating)),
        reviewCount: Math.max(0, item.reviewCount),
        imageUrl: item.imageUrl.trim(),
        createdAt: item.createdAt,
        status: ['active', 'sold', 'expired'].includes(item.status)
          ? item.status
          : 'active' as MarketplaceItem['status'],
        features: item.features.map(feature => feature.trim()).filter(feature => feature.length > 0)
      }));
      
      setMarketplaceItems(validatedItems);
      
      // Cache the validated data
      localStorage.setItem(cacheKey, JSON.stringify(validatedItems));
      localStorage.setItem(`${cacheKey}_time`, now.toString());
      
    } catch (error) {
      console.error('Failed to fetch marketplace items:', error);
      // Set fallback data on error
      setMarketplaceItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'real-estate':
        return 'bg-blue-100 text-blue-800';
      case 'services':
        return 'bg-green-100 text-green-800';
      case 'software':
        return 'bg-purple-100 text-purple-800';
      case 'startup':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'service':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'product':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to access the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-2">Discover investment opportunities, services, and products</p>
            </div>
            <button
              onClick={fetchMarketplaceItems}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search items, categories, or tags..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="real-estate">Real Estate</option>
                <option value="services">Services</option>
                <option value="software">Software</option>
                <option value="startup">Startup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setPriceRange({ min: 0, max: 10000 })}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading marketplace items...</p>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="text-6xl text-gray-400">
                    {getTypeIcon(item.type)}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category.replace('-', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                      <span className="text-sm text-gray-500">({item.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Seller</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.seller.name}</span>
                        {item.seller.verified && (
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-medium">{item.seller.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Reputation</span>
                      <span className="text-sm font-medium">{item.seller.reputation}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {item.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplacePage;