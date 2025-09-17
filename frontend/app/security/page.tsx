'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../../components/ui/wallet-provider';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  loginAlerts: boolean;
  deviceManagement: boolean;
  lastPasswordChange: string;
  activeSessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | '2fa_enabled' | 'device_added' | 'suspicious_activity';
  description: string;
  timestamp: string;
  ip: string;
  location: string;
  status: 'success' | 'failed' | 'warning';
}

const SecurityPage: React.FC = () => {
  const { isConnected } = useWallet();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    if (isConnected) {
      fetchSecurityData();
    }
  }, [isConnected]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      // Mock security data - replace with actual API call
      const mockSettings: SecuritySettings = {
        twoFactorEnabled: false,
        emailNotifications: true,
        smsNotifications: false,
        loginAlerts: true,
        deviceManagement: true,
        lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        activeSessions: [
          {
            id: '1',
            device: 'Chrome on Windows',
            location: 'San Francisco, CA',
            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            current: true
          },
          {
            id: '2',
            device: 'Safari on iPhone',
            location: 'New York, NY',
            lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            current: false
          }
        ]
      };

      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'login',
          description: 'Successful login from Chrome on Windows',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          status: 'success'
        },
        {
          id: '2',
          type: 'password_change',
          description: 'Password changed successfully',
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.100',
          location: 'San Francisco, CA',
          status: 'success'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          description: 'Failed login attempt from unknown device',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          ip: '203.0.113.1',
          location: 'Unknown',
          status: 'warning'
        },
        {
          id: '4',
          type: 'device_added',
          description: 'New device added: Safari on iPhone',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.101',
          location: 'New York, NY',
          status: 'success'
        }
      ];

      setSecuritySettings(mockSettings);
      setSecurityEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting: keyof SecuritySettings, value: boolean) => {
    try {
      setLoading(true);
      // Mock API call - replace with actual implementation
      setSecuritySettings(prev => prev ? { ...prev, [setting]: value } : null);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async () => {
    try {
      setLoading(true);
      // Mock 2FA setup - replace with actual implementation
      setSecuritySettings(prev => prev ? { ...prev, twoFactorEnabled: true } : null);
      setShow2FASetup(false);
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setLoading(true);
      // Mock session revocation - replace with actual implementation
      setSecuritySettings(prev => prev ? {
        ...prev,
        activeSessions: prev.activeSessions.filter(session => session.id !== sessionId)
      } : null);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'password_change':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case '2fa_enabled':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'device_added':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'suspicious_activity':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600">Please connect your wallet to manage security settings.</p>
        </div>
      </div>
    );
  }

  if (loading && !securitySettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and privacy settings</p>
        </div>

        {securitySettings && (
          <div className="space-y-8">
            {/* Security Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    securitySettings.twoFactorEnabled ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-8 h-8 ${
                      securitySettings.twoFactorEnabled ? 'text-green-600' : 'text-red-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-500">
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Account Security</h3>
                  <p className="text-sm text-gray-500">Good</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Last Password Change</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(securitySettings.lastPasswordChange)}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {securitySettings.twoFactorEnabled ? (
                      <span className="text-green-600 font-medium">Enabled</span>
                    ) : (
                      <button
                        onClick={() => setShow2FASetup(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive security alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Receive security alerts via SMS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.smsNotifications}
                      onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Login Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginAlerts}
                      onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h2>
              <div className="space-y-4">
                {securitySettings.activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.device}</h3>
                        <p className="text-sm text-gray-500">{session.location}</p>
                        <p className="text-xs text-gray-400">
                          Last active: {formatDate(session.lastActive)} at {formatTime(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.current && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                      {!session.current && (
                        <button
                          onClick={() => handleRevokeSession(session.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h2>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{event.description}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {event.location} • {event.ip}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Setup Two-Factor Authentication</h2>
                  <button
                    onClick={() => setShow2FASetup(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter verification code
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handle2FASetup}
                      disabled={loading || twoFactorCode.length !== 6}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Setting up...' : 'Complete Setup'}
                    </button>
                    <button
                      onClick={() => setShow2FASetup(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityPage;