'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  CurrencyDollarIcon,
  MapPinIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: string;
  type: 'user' | 'investment';
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
  metadata?: {
    location?: string;
    reputation?: number;
    amount?: number;
    interestRate?: number;
    status?: string;
  };
  url: string;
}

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search users, investments...',
  onSearch,
  onResultClick,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      performSearch(query);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setIsSearching(true);
      setShowResults(true);

      // Mock search results - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResults: SearchResult[] = [
        {
          id: 'user_1',
          type: 'user',
          title: 'Sarah Johnson',
          subtitle: 'Entrepreneur & Business Owner',
          description: 'Passionate about sustainable business practices and community development.',
          image: '/api/placeholder/40/40',
          metadata: {
            location: 'San Francisco, CA',
            reputation: 875
          },
          url: '/profile/user_1'
        },
        {
          id: 'inv_1',
          type: 'investment',
          title: 'Business Expansion Loan',
          subtitle: 'Sarah Johnson',
          description: 'Seeking funding to expand sustainable product line and reach new markets.',
          image: '/api/placeholder/40/40',
          metadata: {
            amount: 5000,
            interestRate: 8.5,
            status: 'active'
          },
          url: '/investments/inv_1'
        },
        {
          id: 'user_2',
          type: 'user',
          title: 'Mike Chen',
          subtitle: 'Tech Investor & Mentor',
          description: 'Experienced investor with focus on fintech and social impact startups.',
          image: '/api/placeholder/40/40',
          metadata: {
            location: 'New York, NY',
            reputation: 1200
          },
          url: '/profile/user_2'
        },
        {
          id: 'inv_2',
          type: 'investment',
          title: 'Equipment Purchase',
          subtitle: 'Mike Chen',
          description: 'Funding needed for new manufacturing equipment to increase production capacity.',
          image: '/api/placeholder/40/40',
          metadata: {
            amount: 15000,
            interestRate: 12.0,
            status: 'pending'
          },
          url: '/investments/inv_2'
        }
      ];

      // Filter results based on query
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.metadata?.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleResultClick(results[activeIndex]);
      } else if (onSearch) {
        onSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setShowResults(false);
    setActiveIndex(-1);
    setQuery('');
  };

  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const getResultIcon = (type: string) => {
    return type === 'user' ? (
      <UserIcon className="h-5 w-5 text-blue-600" />
    ) : (
      <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      completed: 'text-blue-600 bg-blue-100',
      defaulted: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatReputation = (reputation: number) => {
    if (reputation >= 1000) return `${(reputation / 1000).toFixed(1)}k`;
    return reputation.toString();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No results found</p>
              <p className="text-sm text-gray-400">Try different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index === activeIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getResultIcon(result.type)}
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        {result.metadata?.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.metadata.status)}`}>
                            {result.metadata.status}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {result.subtitle}
                      </p>
                      
                      {result.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        {result.metadata?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{result.metadata.location}</span>
                          </div>
                        )}
                        
                        {result.metadata?.reputation && (
                          <div className="flex items-center space-x-1">
                            <StarIcon className="h-3 w-3" />
                            <span>{formatReputation(result.metadata.reputation)}</span>
                          </div>
                        )}
                        
                        {result.metadata?.amount && (
                          <span className="font-medium text-gray-700">
                            {formatCurrency(result.metadata.amount)}
                          </span>
                        )}
                        
                        {result.metadata?.interestRate && (
                          <span className="font-medium text-gray-700">
                            {result.metadata.interestRate}% APR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search Footer */}
          {results.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex items-center space-x-2">
                  <span>Use ↑↓ to navigate</span>
                  <span>•</span>
                  <span>Enter to select</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
