'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '../components/ui/wallet-provider';
import api from './api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'investment' | 'payment' | 'system' | 'social' | 'security';
  actionUrl?: string;
  createdAt: string;
  sender?: {
    name: string;
    walletAddress: string;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: (options?: { page?: number; unreadOnly?: boolean; category?: string }) => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<void>;
  connected: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const { isConnected, user } = useWallet();

  useEffect(() => {
    if (isConnected && user) {
      initializeSocket();
      fetchNotifications();
      fetchUnreadCount();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isConnected, user]);

  const initializeSocket = () => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000');

    newSocket.on('connect', () => {
      console.log('Connected to notification server');
      setConnected(true);
      if (user) {
        newSocket.emit('join', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from notification server');
      setConnected(false);
    });

    newSocket.on('newNotification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      if (notification.priority === 'high' || notification.priority === 'urgent') {
        showBrowserNotification(notification);
      }
    });

    newSocket.on('notificationsMarkedRead', () => {
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const fetchNotifications = async (options: { page?: number; unreadOnly?: boolean; category?: string } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.unreadOnly) queryParams.append('unreadOnly', 'true');
      if (options.category) queryParams.append('category', options.category);

      const response = await api.get(`/notifications?${queryParams.toString()}`);
      
      if (options.page && options.page > 1) {
        setNotifications(prev => [...prev, ...response.notifications]);
      } else {
        setNotifications(response.notifications);
      }
      
      setUnreadCount(response.unreadCount);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error('Fetch unread count error:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Mark all as read error:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError('Failed to delete notification');
      console.error('Delete notification error:', err);
    }
  };

  const createNotification = async (notificationData: Partial<Notification>) => {
    try {
      await api.post('/notifications/create', notificationData);
    } catch (err) {
      setError('Failed to create notification');
      console.error('Create notification error:', err);
    }
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    createNotification,
    connected
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};