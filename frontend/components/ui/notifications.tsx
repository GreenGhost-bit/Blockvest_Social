'use client';

import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  actionUrl?: string;
}

interface NotificationsProps {
  userId?: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({
  userId,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Mock data for now - replace with actual API calls
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Investment Funded',
          message: 'Your investment in Sarah\'s business has been successfully funded.',
          timestamp: '2 hours ago',
          isRead: false,
          data: { investmentId: 'inv_123', amount: 500 },
          actionUrl: '/investments/inv_123'
        },
        {
          id: '2',
          type: 'info',
          title: 'New Follower',
          message: 'Mike started following you. Connect with them to build your network.',
          timestamp: '1 day ago',
          isRead: false,
          data: { followerId: 'user_456', followerName: 'Mike' },
          actionUrl: '/profile/user_456'
        },
        {
          id: '3',
          type: 'warning',
          title: 'Repayment Due Soon',
          message: 'Your repayment of $150 is due in 3 days. Please ensure sufficient funds.',
          timestamp: '2 days ago',
          isRead: true,
          data: { investmentId: 'inv_789', amount: 150, dueDate: '2024-01-15' },
          actionUrl: '/investments/inv_789'
        },
        {
          id: '4',
          type: 'success',
          title: 'Verification Completed',
          message: 'Your KYC verification has been completed successfully. You can now access higher limits.',
          timestamp: '3 days ago',
          isRead: true,
          data: { verificationLevel: 'enhanced', newLimit: 10000 }
        },
        {
          id: '5',
          type: 'error',
          title: 'Payment Failed',
          message: 'Your scheduled payment of $200 failed due to insufficient funds.',
          timestamp: '4 days ago',
          isRead: false,
          data: { investmentId: 'inv_101', amount: 200, reason: 'Insufficient funds' },
          actionUrl: '/investments/inv_101'
        }
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleClearAll = () => {
    setNotifications([]);
    
    if (onClearAll) {
      onClearAll();
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: InformationCircleIcon,
      success: CheckCircleIcon,
      warning: ExclamationTriangleIcon,
      error: XCircleIcon
    };
    const IconComponent = icons[type as keyof typeof icons] || InformationCircleIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getNotificationBorderColor = (type: string) => {
    const colors = {
      info: 'border-blue-200',
      success: 'border-green-200',
      warning: 'border-yellow-200',
      error: 'border-red-200'
    };
    return colors[type as keyof typeof colors] || 'border-gray-200';
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTimestamp = (timestamp: string) => {
    // Simple timestamp formatting - replace with proper date library if needed
    return timestamp;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notifications Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                  className={`text-xs px-2 py-1 rounded ${
                    showUnreadOnly 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {showUnreadOnly ? 'All' : 'Unread'}
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-1 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            notification.isRead ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-1 ${
                          notification.isRead ? 'text-gray-600' : 'text-blue-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.actionUrl && (
                              <span className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                View details →
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default Notifications;
