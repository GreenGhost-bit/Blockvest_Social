'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from './wallet-provider';

interface Notification {
  id: string;
  type: 'investment' | 'payment' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const NotificationsDropdown: React.FC = () => {
  const { isConnected } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isConnected) {
      fetchNotifications();
    }
  }, [isConnected]);

  const fetchNotifications = async () => {
    try {
      // Check cache first
      const cacheKey = 'notifications';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      const now = Date.now();
      
      // Use cached data if it's less than 2 minutes old
      if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 120000) {
        const cachedNotifications = JSON.parse(cachedData);
        setNotifications(cachedNotifications);
        setUnreadCount(cachedNotifications.filter((n: Notification) => !n.read).length);
        return;
      }
      
      // Mock notifications for now - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'investment',
          title: 'Investment Funded',
          message: 'Your investment request for $1,000 has been funded by Alice Johnson',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/investments'
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment Received',
          message: 'You received a payment of $150 from Bob Smith',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/investments'
        },
        {
          id: '3',
          type: 'system',
          title: 'Risk Assessment Updated',
          message: 'Your risk score has been updated to 75/100',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/reputation'
        },
        {
          id: '4',
          type: 'security',
          title: 'New Login Detected',
          message: 'A new device logged into your account',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          actionUrl: '/security'
        }
      ];
      
      // Validate and sanitize notifications
      const validatedNotifications = mockNotifications.map(notification => ({
        ...notification,
        id: notification.id.trim(),
        type: ['investment', 'payment', 'system', 'security'].includes(notification.type) 
          ? notification.type 
          : 'system' as 'investment' | 'payment' | 'system' | 'security',
        title: notification.title.trim(),
        message: notification.message.trim(),
        timestamp: notification.timestamp,
        read: Boolean(notification.read),
        actionUrl: notification.actionUrl?.trim() || undefined
      }));
      
      setNotifications(validatedNotifications);
      setUnreadCount(validatedNotifications.filter(n => !n.read).length);
      
      // Cache the validated data
      localStorage.setItem(cacheKey, JSON.stringify(validatedNotifications));
      localStorage.setItem(`${cacheKey}_time`, now.toString());
      
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set fallback data on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      // Update cache
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notification => ({ ...notification, read: true }));
      
      // Update cache
      localStorage.setItem('notifications', JSON.stringify(updated));
      
      return updated;
    });
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'payment':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'security':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h-5l5-5 5 5h-5v12z" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h-5l5-5 5 5h-5v12z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchNotifications}
                  className="text-sm text-gray-600 hover:text-gray-800 p-1 rounded"
                  title="Refresh notifications"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <a
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationsDropdown;