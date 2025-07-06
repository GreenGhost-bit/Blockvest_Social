'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from './wallet-provider';
import { useNotifications } from '../../lib/notifications-context';
import api from '../../lib/api';

interface MFAStatus {
  isEnabled: boolean;
  enabledMethods: string[];
  settings: {
    requireMFAForLogin: boolean;
    requireMFAForTransactions: boolean;
    requireMFAForHighValue: boolean;
    highValueThreshold: number;
    deviceTrustDuration: number;
  };
  trustedDevicesCount: number;
  lastVerification?: string;
  recentFailedAttempts: number;
}

interface TrustedDevice {
  id: string;
  name: string;
  location: any;
  trustedAt: string;
  lastUsed: string;
  expiresAt: string;
  isCurrent: boolean;
}

const MFASetup: React.FC = () => {
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSetup, setActiveSetup] = useState<'totp' | 'algorand' | 'email' | null>(null);
  
  // TOTP Setup
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpToken, setTotpToken] = useState('');
  
  // Algorand Setup
  const [algorandChallenge, setAlgorandChallenge] = useState('');
  
  // Email Setup
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const { signTransaction, user } = useWallet();

  useEffect(() => {
    fetchMFAStatus();
    fetchTrustedDevices();
  }, []);

  const fetchMFAStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mfa/status');
      setMfaStatus(response);
    } catch (err) {
      setError('Failed to fetch MFA status');
      console.error('MFA status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustedDevices = async () => {
    try {
      const response = await api.get('/mfa/trusted-devices');
      setTrustedDevices(response.devices);
    } catch (err) {
      console.error('Trusted devices error:', err);
    }
  };

  const setupTOTP = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/mfa/setup/totp');
      setTotpSecret(response.secret);
      setQrCode(response.qrCode);
      setBackupCodes(response.backupCodes);
      setActiveSetup('totp');
    } catch (err) {
      setError('Failed to set up TOTP');
      console.error('TOTP setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    try {
      setVerifying(true);
      setError(null);
      await api.post('/mfa/verify/totp', {
        token: totpToken,
        isSetupVerification: true
      });
      setSuccess('TOTP authentication enabled successfully!');
      setActiveSetup(null);
      setTotpToken('');
      await fetchMFAStatus();
    } catch (err) {
      setError('Invalid TOTP token. Please try again.');
      console.error('TOTP verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const setupAlgorand = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/mfa/setup/algorand');
      setAlgorandChallenge(response.challenge);
      setActiveSetup('algorand');
    } catch (err) {
      setError('Failed to set up Algorand signature MFA');
      console.error('Algorand setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyAlgorand = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      const messageBytes = new TextEncoder().encode(algorandChallenge);
      const signature = await signTransaction(messageBytes);
      
      await api.post('/mfa/verify/algorand', {
        challenge: algorandChallenge,
        signature: signature,
        isSetupVerification: true
      });
      
      setSuccess('Algorand signature MFA enabled successfully!');
      setActiveSetup(null);
      setAlgorandChallenge('');
      await fetchMFAStatus();
    } catch (err) {
      setError('Failed to verify Algorand signature');
      console.error('Algorand verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const setupEmail = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await api.post('/mfa/setup/email');
      setEmailSent(true);
      setActiveSetup('email');
      setSuccess(`Verification code sent to ${response.email}`);
    } catch (err) {
      setError('Failed to send email verification code');
      console.error('Email setup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    try {
      setVerifying(true);
      setError(null);
      await api.post('/mfa/verify/email', {
        code: emailCode,
        isSetupVerification: true
      });
      setSuccess('Email MFA enabled successfully!');
      setActiveSetup(null);
      setEmailCode('');
      setEmailSent(false);
      await fetchMFAStatus();
    } catch (err) {
      setError('Invalid verification code. Please try again.');
      console.error('Email verification error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const disableMFA = async (method: string) => {
    try {
      setError(null);
      await api.delete(`/mfa/disable/${method}`);
      setSuccess(`${method.toUpperCase()} MFA disabled successfully`);
      await fetchMFAStatus();
    } catch (err) {
      setError(`Failed to disable ${method} MFA`);
      console.error('Disable MFA error:', err);
    }
  };

  const removeTrustedDevice = async (deviceId: string) => {
    try {
      await api.delete(`/mfa/trusted-devices/${deviceId}`);
      await fetchTrustedDevices();
    } catch (err) {
      setError('Failed to remove trusted device');
      console.error('Remove device error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && !mfaStatus) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h2>
            <p className="text-gray-600 mt-2">Secure your account with additional authentication methods</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            mfaStatus?.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {mfaStatus?.isEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p>{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {mfaStatus && mfaStatus.recentFailedAttempts > 0 && (
          <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>⚠️ {mfaStatus.recentFailedAttempts} recent failed MFA attempts detected</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TOTP Authenticator */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Authenticator App</h3>
                  <p className="text-sm text-gray-600">Use an app like Google Authenticator</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                mfaStatus?.enabledMethods.includes('totp') ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>

            {!mfaStatus?.enabledMethods.includes('totp') ? (
              <button
                onClick={setupTOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable TOTP'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enabled
                </div>
                <button
                  onClick={() => disableMFA('totp')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Disable TOTP
                </button>
              </div>
            )}
          </div>

          {/* Algorand Signature */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wallet Signature</h3>
                  <p className="text-sm text-gray-600">Sign with your Algorand wallet</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                mfaStatus?.enabledMethods.includes('algorand_signature') ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>

            {!mfaStatus?.enabledMethods.includes('algorand_signature') ? (
              <button
                onClick={setupAlgorand}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable Wallet Signature'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enabled
                </div>
                <button
                  onClick={() => disableMFA('algorand')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Disable Wallet Signature
                </button>
              </div>
            )}
          </div>

          {/* Email Verification */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                  <p className="text-sm text-gray-600">Receive codes via email</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                mfaStatus?.enabledMethods.includes('email') ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
            </div>

            {!mfaStatus?.enabledMethods.includes('email') ? (
              <button
                onClick={setupEmail}
                disabled={loading || !user?.profile?.email}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Enable Email MFA'}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Enabled
                </div>
                <button
                  onClick={() => disableMFA('email')}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors text-sm"
                >
                  Disable Email MFA
                </button>
              </div>
            )}
            
            {!user?.profile?.email && (
              <p className="text-xs text-red-600 mt-2">Email required in profile</p>
            )}
          </div>
        </div>
      </div>

      {/* Setup Modals */}
      {activeSetup === 'totp' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup TOTP Authenticator</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                1. Install an authenticator app like Google Authenticator or Authy
              </p>
              <p className="text-sm text-gray-600 mb-4">
                2. Scan this QR code with your authenticator app:
              </p>
              
              {qrCode && (
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="QR Code" className="border border-gray-300 rounded" />
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">Manual entry key:</p>
                <code className="bg-white px-2 py-1 rounded text-sm font-mono break-all">{totpSecret}</code>
              </div>
            </div>

            <div>
              <label htmlFor="totpToken" className="block text-sm font-medium text-gray-700 mb-2">
                3. Enter the 6-digit code from your authenticator app:
              </label>
              <input
                type="text"
                id="totpToken"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Backup Codes</h4>
                <p className="text-xs text-yellow-700 mb-3">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-white px-2 py-1 rounded text-xs font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={verifyTOTP}
                disabled={verifying || totpToken.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                onClick={() => setActiveSetup(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSetup === 'algorand' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Setup Algorand Wallet Signature</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-800">
                Sign the following challenge with your connected Algorand wallet to enable signature-based MFA.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">Challenge to sign:</p>
              <code className="bg-white px-2 py-1 rounded text-sm font-mono break-all">{algorandChallenge}</code>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={verifyAlgorand}
                disabled={verifying}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Signing...' : 'Sign & Enable'}
              </button>
              <button
                onClick={() => setActiveSetup(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSetup === 'email' && emailSent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verify Email</h3>
          
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-sm text-green-800">
                A verification code has been sent to your email address. Enter it below to enable email MFA.
              </p>
            </div>

            <div>
              <label htmlFor="emailCode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter the 6-digit verification code:
              </label>
              <input
                type="text"
                id="emailCode"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={verifyEmail}
                disabled={verifying || emailCode.length !== 6}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                onClick={() => setActiveSetup(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trusted Devices */}
      {trustedDevices.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trusted Devices</h3>
          
          <div className="space-y-3">
            {trustedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${device.isCurrent ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {device.name} {device.isCurrent && '(Current)'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Trusted on {formatDate(device.trustedAt)} • Expires {formatDate(device.expiresAt)}
                    </p>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button
                    onClick={() => removeTrustedDevice(device.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MFASetup;