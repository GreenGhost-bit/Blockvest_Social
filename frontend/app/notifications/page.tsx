'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';
import { useNotifications } from '../../lib/notifications-context';

const NotificationsPage: React.FC = () => {
  const { isConnected } = useWallet();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    fetchNotifications,
    connected 
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'investment' | 'payment' | 'system'>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isConnected) {
      fetchNotifications({ 
        page: 1, 
        unreadOnly: filter === 'unread',
        category: filter !== 'all' && filter !== 'unread' ? filter : undefined
      });
      setPage(1);
    }
  }, [isConnected, filter]);

  const loadMore = () => {
    const nextPage = page + 1;
    fetchNotifications({ 
      page: nextPage, 
      unreadOnly: filter === 'unread',
      category: filter !== 'all' && filter !== 'unread' ? filter : undefined
    });
    setPage(nextPage);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'investment_created':
        return '💰';
      case 'investment_funded':
        return '✅';
      case 'payment_received':
        return '💳';
      case 'payment_overdue':
        return '⚠️';
      case 'investment_completed':
        return '🎉';
      case 'investment_defaulted':
        return '❌';
      case 'profile_verified':
        return '✅';
      case 'reputation_updated':
        return '⭐';
      case 'new_message':
        return '💬';
      case 'system_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-blue-500 bg-blue-50';
      case 'low':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.4-3.4a9.02 9.02 0 001.4-5.6 9 9 0 00-18 0c0 2.1.7 4.1 1.9 5.6L0 17h5" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Please connect your wallet to view your notifications
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your investment activities and platform updates
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex space-x-1">
                {(['all', 'unread', 'investment', 'payment', 'system'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-100'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.4-3.4a9.02 9.02 0 001.4-5.6 9 9 0 00-18 0c0 2.1.7 4.1 1.9 5.6L0 17h5" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600">
                  {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${
                      !notification.read ? getPriorityColor(notification.priority) : 'border-gray-200'
                    } ${notification.actionUrl ? 'cursor-pointer' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-lg font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-3">
                            {!notification.read && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{notification.message}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            {notification.sender && (
                              <span className="text-sm text-gray-500">
                                From: {notification.sender.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.category === 'investment' ? 'bg-blue-100 text-blue-800' :
                              notification.category === 'payment' ? 'bg-green-100 text-green-800' :
                              notification.category === 'system' ? 'bg-gray-100 text-gray-800' :
                              notification.category === 'social' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {notification.category}
                            </span>
                            {notification.priority === 'urgent' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Urgent
                              </span>
                            )}
                            {notification.priority === 'high' && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length >= 20 && (
                  <div className="p-4 text-center border-t border-gray-200">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;