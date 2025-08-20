'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  AcademicCapIcon,
  StarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  LinkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  ClockIcon,
  FireIcon,
  GlobeAltIcon,
  CogIcon,
  BellIcon,
  HeartIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  education?: string;
  skills?: string[];
  profilePicture?: string;
  reputationScore: number;
  reputationLevel: string;
  verificationStatus: string;
  kycLevel?: string;
  followers: number;
  following: number;
  connections: number;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  badges?: string[];
  joinedDate: string;
  lastActive: string;
  portfolioStats: {
    totalInvested: number;
    totalEarnings: number;
    activeInvestments: number;
    completedInvestments: number;
    averageROI: number;
    totalTransactions: number;
    riskScore: number;
    preferredCategories: string[];
  };
  investmentHistory: Array<{
    id: string;
    type: 'investment' | 'repayment' | 'withdrawal';
    amount: number;
    status: 'active' | 'completed' | 'defaulted';
    date: string;
    description: string;
    roi?: number;
  }>;
  socialConnections: Array<{
    id: string;
    name: string;
    profilePicture: string;
    reputation: number;
    connectionType: 'follower' | 'following' | 'mutual';
    lastInteraction: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedDate: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  preferences: {
    investmentRange: string;
    riskTolerance: string;
    preferredSectors: string[];
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

interface UserProfileProps {
  userId: string;
  isOwnProfile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, isOwnProfile = false }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const mockProfile: UserProfile = {
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate entrepreneur and investor with 10+ years of experience in fintech and social impact. Building the future of decentralized finance.',
        location: 'San Francisco, CA',
        occupation: 'CEO & Founder',
        education: 'MBA, Stanford University',
        skills: ['Blockchain', 'Fintech', 'Social Impact', 'Leadership', 'Strategy', 'AI/ML', 'DeFi'],
        profilePicture: '/api/placeholder/150/150',
        reputationScore: 892,
        reputationLevel: 'gold',
        verificationStatus: 'verified',
        kycLevel: 'enhanced',
        followers: 234,
        following: 156,
        connections: 45,
        socialLinks: {
          twitter: 'https://twitter.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com'
        },
        badges: ['Verified Investor', 'Top Performer', 'Community Leader', 'Early Adopter'],
        joinedDate: '2023-01-15',
        lastActive: '2 hours ago',
        portfolioStats: {
          totalInvested: 15680.50,
          totalEarnings: 3247.85,
          activeInvestments: 5,
          completedInvestments: 18,
          averageROI: 12.7,
          totalTransactions: 89,
          riskScore: 23,
          preferredCategories: ['Fintech', 'AI/ML', 'Social Impact', 'Blockchain']
        },
        investmentHistory: [
          {
            id: '1',
            type: 'investment',
            amount: 2500,
            status: 'active',
            date: '2024-01-15',
            description: 'Investment in AI-powered fintech startup',
            roi: 8.5
          },
          {
            id: '2',
            type: 'repayment',
            amount: 1500,
            status: 'completed',
            date: '2024-01-10',
            description: 'Repayment from blockchain project',
            roi: 15.2
          },
          {
            id: '3',
            type: 'investment',
            amount: 3000,
            status: 'active',
            date: '2024-01-05',
            description: 'Social impact investment fund',
            roi: 6.8
          }
        ],
        socialConnections: [
          {
            id: '1',
            name: 'Sarah Johnson',
            profilePicture: '/api/placeholder/40/40',
            reputation: 756,
            connectionType: 'mutual',
            lastInteraction: '1 day ago'
          },
          {
            id: '2',
            name: 'Mike Chen',
            profilePicture: '/api/placeholder/40/40',
            reputation: 892,
            connectionType: 'follower',
            lastInteraction: '3 days ago'
          }
        ],
        achievements: [
          {
            id: '1',
            title: 'First Investment',
            description: 'Completed your first investment on the platform',
            icon: '🎯',
            earnedDate: '2023-02-01',
            rarity: 'common'
          },
          {
            id: '2',
            title: 'Top Performer',
            description: 'Achieved top 10% performance in your portfolio',
            icon: '🏆',
            earnedDate: '2023-12-15',
            rarity: 'rare'
          },
          {
            id: '3',
            title: 'Community Leader',
            description: 'Helped 50+ users with investment decisions',
            icon: '👑',
            earnedDate: '2024-01-01',
            rarity: 'epic'
          }
        ],
        preferences: {
          investmentRange: '$1K - $10K',
          riskTolerance: 'Moderate',
          preferredSectors: ['Fintech', 'AI/ML', 'Blockchain'],
          notificationSettings: {
            email: true,
            push: true,
            sms: false
          }
        }
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReputationColor = (level: string) => {
    const colors = {
      bronze: 'text-amber-600 bg-amber-100',
      silver: 'text-gray-600 bg-gray-100',
      gold: 'text-yellow-600 bg-yellow-100',
      platinum: 'text-blue-600 bg-blue-100',
      diamond: 'text-purple-600 bg-purple-100',
      master: 'text-red-600 bg-red-100',
      legend: 'text-green-600 bg-green-100'
    };
    return colors[level as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getVerificationColor = (status: string) => {
    const colors = {
      verified: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      rejected: 'text-red-600 bg-red-100',
      unverified: 'text-gray-600 bg-gray-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getAchievementRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      defaulted: 'text-red-600 bg-red-100'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnected(!isConnected);
    } catch (error) {
      console.error('Error connecting with user:', error);
    }
  };

  const handleMessage = () => {
    console.log('Open messaging with user');
  };

  const handleEditProfile = () => {
    setEditMode(!editMode);
  };

  const filteredInvestments = profile?.investmentHistory.filter(inv => {
    if (filterType !== 'all' && inv.type !== filterType) return false;
    if (searchQuery && !inv.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <img
                    src={profile.profilePicture || '/api/placeholder/120/120'}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  {profile.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
                      <ShieldCheckIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.occupation && (
                    <p className="text-xl opacity-90 mb-2">{profile.occupation}</p>
                  )}
                  {profile.location && (
                    <div className="flex items-center text-sm opacity-80">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {profile.location}
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  {isOwnProfile && (
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                    >
                      <CogIcon className="h-4 w-4 mr-1 inline" />
                      Edit Profile
                    </button>
                  )}
                  {!isOwnProfile && (
                    <>
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={handleConnect}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${
                          isConnected
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-6 py-2 bg-white text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors"
                      >
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getReputationColor(profile.reputationLevel)}`}>
                  <StarIcon className="h-4 w-4 mr-1" />
                  {profile.reputationLevel} ({profile.reputationScore})
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVerificationColor(profile.verificationStatus)}`}>
                  <ShieldCheckIcon className="h-4 w-4 mr-1" />
                  {profile.verificationStatus}
                </span>
                {profile.kycLevel && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-600">
                    KYC {profile.kycLevel}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{profile.followers}</div>
                  <div>Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{profile.following}</div>
                  <div>Following</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{profile.connections}</div>
                  <div>Connections</div>
                </div>
              </div>
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-6 leading-relaxed">{profile.bio}</p>
            )}

            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio Stats Overview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
              <button
                onClick={() => setShowPortfolio(!showPortfolio)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showPortfolio ? 'Hide Details' : 'View Details'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(profile.portfolioStats.totalInvested)}</div>
                <div className="text-sm text-gray-500">Total Invested</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(profile.portfolioStats.totalEarnings)}</div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatPercentage(profile.portfolioStats.averageROI)}</div>
                <div className="text-sm text-gray-500">Average ROI</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.portfolioStats.activeInvestments}</div>
                <div className="text-sm text-gray-500">Active Investments</div>
              </div>
            </div>
            
            {showPortfolio && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Profile</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${100 - profile.portfolioStats.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{profile.portfolioStats.riskScore}/100</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Low risk profile</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preferred Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.portfolioStats.preferredCategories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'portfolio', 'connections', 'achievements'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* About Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                  <div className="space-y-4">
                    {profile.education && (
                      <div className="flex items-start space-x-3">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Education</p>
                          <p className="text-sm text-gray-600">{profile.education}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile.skills && profile.skills.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Skills</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profile.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Member Since</p>
                        <p className="text-sm text-gray-600">
                          {new Date(profile.joinedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Active</p>
                        <p className="text-sm text-gray-600">{profile.lastActive}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {profile.socialLinks.twitter && (
                        <a
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Twitter</span>
                        </a>
                      )}
                      
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                        </a>
                      )}
                      
                      {profile.socialLinks.github && (
                        <a
                          href={profile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">GitHub</span>
                        </a>
                      )}
                      
                      {profile.socialLinks.website && (
                        <a
                          href={profile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                        >
                          <LinkIcon className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Investment History</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search investments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="investment">Investment</option>
                      <option value="repayment">Repayment</option>
                      <option value="withdrawal">Withdrawal</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredInvestments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          investment.status === 'active' ? 'bg-blue-500' :
                          investment.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{investment.description}</p>
                          <p className="text-xs text-gray-500">{new Date(investment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(investment.amount)}</p>
                        {investment.roi && (
                          <p className="text-xs text-green-600">ROI: {formatPercentage(investment.roi)}</p>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                          {investment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Social Connections</h3>
                <div className="space-y-4">
                  {profile.socialConnections.map((connection) => (
                    <div key={connection.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <img
                          src={connection.profilePicture}
                          alt={connection.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{connection.name}</p>
                          <p className="text-xs text-gray-500">Reputation: {connection.reputation}</p>
                          <p className="text-xs text-gray-400">Last interaction: {connection.lastInteraction}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          connection.connectionType === 'mutual' ? 'bg-blue-100 text-blue-800' :
                          connection.connectionType === 'follower' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {connection.connectionType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Achievements & Badges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                          <p className="text-xs text-gray-600">{achievement.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Earned: {new Date(achievement.earnedDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAchievementRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact & Stats */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
                
                {profile.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reputation Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reputation Details</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Current Level</span>
                    <span className={`font-medium ${getReputationColor(profile.reputationLevel).split(' ')[0]}`}>
                      {profile.reputationLevel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((profile.reputationScore % 1000) / 10)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.reputationScore} / {Math.ceil(profile.reputationScore / 1000) * 1000} points
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Level Benefits:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Higher investment limits</li>
                    <li>• Lower interest rates</li>
                    <li>• Priority support</li>
                    <li>• Exclusive features</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Preferences</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Investment Range</p>
                  <p className="text-sm font-medium text-gray-900">{profile.preferences.investmentRange}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Tolerance</p>
                  <p className="text-sm font-medium text-gray-900">{profile.preferences.riskTolerance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Preferred Sectors</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.preferences.preferredSectors.map((sector, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
