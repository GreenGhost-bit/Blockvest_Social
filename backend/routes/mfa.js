const express = require('express');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const algosdk = require('algosdk');
const nodemailer = require('nodemailer');
const MFA = require('../models/MFA');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

const router = express.Router();

const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      mfa = new MFA({ user: userId });
      await mfa.save();
    }

    const enabledMethods = [];
    if (mfa.methods.totp.enabled) enabledMethods.push('totp');
    if (mfa.methods.algorandSignature.enabled) enabledMethods.push('algorand_signature');
    if (mfa.methods.email.enabled) enabledMethods.push('email');

    res.json({
      isEnabled: mfa.isEnabled,
      enabledMethods,
      settings: mfa.settings,
      trustedDevicesCount: mfa.trustedDevices.filter(d => d.isActive && new Date() < d.expiresAt).length,
      lastVerification: mfa.lastMFAVerification,
      recentFailedAttempts: mfa.getRecentFailedAttempts()
    });
  } catch (error) {
    console.error('MFA status error:', error);
    res.status(500).json({ error: 'Failed to get MFA status' });
  }
});

router.post('/setup/totp', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    let mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      mfa = new MFA({ user: userId });
    }

    if (mfa.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `${user.profile.name || user.walletAddress}`,
      issuer: 'Blockvest Social',
      length: 20
    });

    mfa.methods.totp.secret = secret.base32;
    
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    mfa.methods.totp.qrCodeUrl = qrCodeUrl;
    
    const backupCodes = mfa.generateBackupCodes();
    
    await mfa.save();

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ error: 'Failed to set up TOTP' });
  }
});

router.post('/verify/totp', authenticateToken, async (req, res) => {
  try {
    const { token, isSetupVerification = false } = req.body;
    const userId = req.user.userId;
    
    if (!token) {
      return res.status(400).json({ error: 'TOTP token is required' });
    }

    const mfa = await MFA.findOne({ user: userId });
    if (!mfa || !mfa.methods.totp.secret) {
      return res.status(400).json({ error: 'TOTP not set up' });
    }

    const verified = speakeasy.totp.verify({
      secret: mfa.methods.totp.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    mfa.logLoginAttempt({
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      method: 'totp',
      success: verified,
      failureReason: verified ? null : 'Invalid TOTP token'
    });

    if (verified) {
      if (isSetupVerification) {
        mfa.methods.totp.enabled = true;
        mfa.methods.totp.verifiedAt = new Date();
        mfa.isEnabled = true;
        
        await Notification.createNotification({
          recipient: userId,
          type: 'security_update',
          title: 'TOTP Authentication Enabled',
          message: 'Two-factor authentication using TOTP has been successfully enabled for your account.',
          category: 'security',
          priority: 'high'
        });
      }
      
      mfa.lastMFAVerification = new Date();
      await mfa.save();
      
      res.json({ 
        success: true, 
        message: isSetupVerification ? 'TOTP enabled successfully' : 'TOTP verification successful'
      });
    } else {
      await mfa.save();
      res.status(400).json({ error: 'Invalid TOTP token' });
    }
  } catch (error) {
    console.error('TOTP verification error:', error);
    res.status(500).json({ error: 'TOTP verification failed' });
  }
});

router.post('/setup/algorand', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    let mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      mfa = new MFA({ user: userId });
    }

    const challenge = mfa.generateAlgorandChallenge();
    
    mfa.methods.algorandSignature.challengeHistory.push({
      challenge,
      timestamp: new Date(),
      verified: false,
      walletAddress: user.walletAddress
    });
    
    await mfa.save();

    res.json({
      challenge,
      message: 'Sign this challenge with your Algorand wallet to enable signature-based MFA'
    });
  } catch (error) {
    console.error('Algorand MFA setup error:', error);
    res.status(500).json({ error: 'Failed to set up Algorand signature MFA' });
  }
});

router.post('/verify/algorand', authenticateToken, async (req, res) => {
  try {
    const { challenge, signature, isSetupVerification = false } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!challenge || !signature) {
      return res.status(400).json({ error: 'Challenge and signature are required' });
    }

    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(400).json({ error: 'MFA not initialized' });
    }

    const challengeEntry = mfa.methods.algorandSignature.challengeHistory.find(
      c => c.challenge === challenge && !c.verified
    );
    
    if (!challengeEntry) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }

    const challengeExpiry = new Date(challengeEntry.timestamp.getTime() + 10 * 60 * 1000);
    if (new Date() > challengeExpiry) {
      return res.status(400).json({ error: 'Challenge expired' });
    }

    try {
      const messageBytes = new TextEncoder().encode(challenge);
      const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));
      
      const verified = algosdk.verifyBytes(messageBytes, signatureBytes, user.walletAddress);
      
      mfa.logLoginAttempt({
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: 'algorand_signature',
        success: verified,
        failureReason: verified ? null : 'Invalid Algorand signature'
      });

      if (verified) {
        challengeEntry.verified = true;
        challengeEntry.signature = signature;
        
        if (isSetupVerification) {
          mfa.methods.algorandSignature.enabled = true;
          mfa.isEnabled = true;
          
          await Notification.createNotification({
            recipient: userId,
            type: 'security_update',
            title: 'Algorand Signature MFA Enabled',
            message: 'Multi-factor authentication using Algorand wallet signatures has been enabled.',
            category: 'security',
            priority: 'high'
          });
        }
        
        mfa.lastMFAVerification = new Date();
        await mfa.save();
        
        res.json({ 
          success: true, 
          message: isSetupVerification ? 'Algorand signature MFA enabled' : 'Signature verification successful'
        });
      } else {
        await mfa.save();
        res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (verificationError) {
      console.error('Signature verification error:', verificationError);
      mfa.logLoginAttempt({
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: 'algorand_signature',
        success: false,
        failureReason: 'Signature verification failed'
      });
      await mfa.save();
      res.status(400).json({ error: 'Signature verification failed' });
    }
  } catch (error) {
    console.error('Algorand verification error:', error);
    res.status(500).json({ error: 'Algorand signature verification failed' });
  }
});

router.post('/setup/email', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    let mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      mfa = new MFA({ user: userId });
    }

    if (!user.profile.email) {
      return res.status(400).json({ error: 'Email address not found in profile' });
    }

    const code = mfa.generateEmailCode();
    await mfa.save();

    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@blockvest.social',
        to: user.profile.email,
        subject: 'Blockvest Social - Email MFA Setup',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email MFA Setup</h2>
            <p>Hello ${user.profile.name || 'User'},</p>
            <p>You are setting up email-based multi-factor authentication for your Blockvest Social account.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h3>Verification Code</h3>
              <div style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 3px;">${code}</div>
            </div>
            <p>This code will expire in 10 minutes. Do not share this code with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `
      });

      res.json({ 
        message: 'Verification code sent to your email address',
        email: user.profile.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  } catch (error) {
    console.error('Email MFA setup error:', error);
    res.status(500).json({ error: 'Failed to set up email MFA' });
  }
});

router.post('/verify/email', authenticateToken, async (req, res) => {
  try {
    const { code, isSetupVerification = false } = req.body;
    const userId = req.user.userId;
    
    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(400).json({ error: 'MFA not initialized' });
    }

    const verified = mfa.verifyEmailCode(code);
    
    mfa.logLoginAttempt({
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      method: 'email',
      success: verified,
      failureReason: verified ? null : 'Invalid email verification code'
    });

    if (verified) {
      if (isSetupVerification) {
        mfa.methods.email.enabled = true;
        mfa.isEnabled = true;
        
        await Notification.createNotification({
          recipient: userId,
          type: 'security_update',
          title: 'Email MFA Enabled',
          message: 'Email-based multi-factor authentication has been successfully enabled.',
          category: 'security',
          priority: 'high'
        });
      }
      
      mfa.methods.email.verificationCode = null;
      mfa.methods.email.codeExpiry = null;
      mfa.lastMFAVerification = new Date();
      await mfa.save();
      
      res.json({ 
        success: true, 
        message: isSetupVerification ? 'Email MFA enabled successfully' : 'Email verification successful'
      });
    } else {
      await mfa.save();
      res.status(400).json({ 
        error: 'Invalid or expired verification code',
        attemptsRemaining: Math.max(0, 5 - mfa.methods.email.verificationAttempts)
      });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

router.post('/verify/backup-code', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.userId;
    
    if (!code) {
      return res.status(400).json({ error: 'Backup code is required' });
    }

    const mfa = await MFA.findOne({ user: userId });
    if (!mfa || !mfa.methods.totp.enabled) {
      return res.status(400).json({ error: 'TOTP not enabled' });
    }

    const verified = mfa.verifyBackupCode(code);
    
    mfa.logLoginAttempt({
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      method: 'backup_code',
      success: verified,
      failureReason: verified ? null : 'Invalid backup code'
    });

    if (verified) {
      mfa.lastMFAVerification = new Date();
      await mfa.save();
      
      const remainingCodes = mfa.methods.totp.backupCodes.filter(bc => !bc.used).length;
      
      if (remainingCodes <= 2) {
        await Notification.createNotification({
          recipient: userId,
          type: 'security_warning',
          title: 'Low Backup Codes',
          message: `You have ${remainingCodes} backup codes remaining. Consider generating new ones.`,
          category: 'security',
          priority: 'medium'
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Backup code verification successful',
        remainingCodes 
      });
    } else {
      await mfa.save();
      res.status(400).json({ error: 'Invalid or already used backup code' });
    }
  } catch (error) {
    console.error('Backup code verification error:', error);
    res.status(500).json({ error: 'Backup code verification failed' });
  }
});

router.post('/trust-device', authenticateToken, async (req, res) => {
  try {
    const { deviceName } = req.body;
    const userId = req.user.userId;
    
    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(400).json({ error: 'MFA not enabled' });
    }

    if (mfa.isTrustedDevice(req.get('User-Agent'), req.ip)) {
      return res.status(400).json({ error: 'Device is already trusted' });
    }

    const deviceId = mfa.addTrustedDevice({
      deviceName: deviceName || 'Unknown Device',
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      location: {}
    });

    await mfa.save();

    await Notification.createNotification({
      recipient: userId,
      type: 'security_update',
      title: 'New Trusted Device Added',
      message: `Device "${deviceName || 'Unknown Device'}" has been added to your trusted devices.`,
      category: 'security',
      priority: 'medium'
    });

    res.json({ 
      message: 'Device trusted successfully',
      deviceId,
      expiresIn: mfa.settings.deviceTrustDuration
    });
  } catch (error) {
    console.error('Trust device error:', error);
    res.status(500).json({ error: 'Failed to trust device' });
  }
});

router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { settings } = req.body;
    
    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(400).json({ error: 'MFA not initialized' });
    }

    if (settings.requireMFAForLogin !== undefined) {
      mfa.settings.requireMFAForLogin = settings.requireMFAForLogin;
    }
    if (settings.requireMFAForTransactions !== undefined) {
      mfa.settings.requireMFAForTransactions = settings.requireMFAForTransactions;
    }
    if (settings.requireMFAForHighValue !== undefined) {
      mfa.settings.requireMFAForHighValue = settings.requireMFAForHighValue;
    }
    if (settings.highValueThreshold !== undefined) {
      mfa.settings.highValueThreshold = settings.highValueThreshold;
    }
    if (settings.deviceTrustDuration !== undefined) {
      mfa.settings.deviceTrustDuration = settings.deviceTrustDuration;
    }

    await mfa.save();

    res.json({ 
      message: 'MFA settings updated successfully',
      settings: mfa.settings 
    });
  } catch (error) {
    console.error('Update MFA settings error:', error);
    res.status(500).json({ error: 'Failed to update MFA settings' });
  }
});

router.delete('/disable/:method', authenticateToken, async (req, res) => {
  try {
    const { method } = req.params;
    const userId = req.user.userId;
    
    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(400).json({ error: 'MFA not found' });
    }

    switch (method) {
      case 'totp':
        mfa.methods.totp.enabled = false;
        mfa.methods.totp.secret = null;
        mfa.methods.totp.backupCodes = [];
        break;
      case 'algorand':
        mfa.methods.algorandSignature.enabled = false;
        break;
      case 'email':
        mfa.methods.email.enabled = false;
        break;
      default:
        return res.status(400).json({ error: 'Invalid MFA method' });
    }

    const enabledMethods = [
      mfa.methods.totp.enabled,
      mfa.methods.algorandSignature.enabled,
      mfa.methods.email.enabled
    ].filter(Boolean);

    if (enabledMethods.length === 0) {
      mfa.isEnabled = false;
    }

    await mfa.save();

    await Notification.createNotification({
      recipient: userId,
      type: 'security_update',
      title: 'MFA Method Disabled',
      message: `${method.toUpperCase()} authentication has been disabled for your account.`,
      category: 'security',
      priority: 'high'
    });

    res.json({ 
      message: `${method.toUpperCase()} MFA disabled successfully`,
      mfaEnabled: mfa.isEnabled 
    });
  } catch (error) {
    console.error('Disable MFA error:', error);
    res.status(500).json({ error: 'Failed to disable MFA method' });
  }
});

router.get('/trusted-devices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.json({ devices: [] });
    }

    const devices = mfa.trustedDevices
      .filter(d => d.isActive && new Date() < d.expiresAt)
      .map(device => ({
        id: device.deviceId,
        name: device.deviceName,
        location: device.location,
        trustedAt: device.trustedAt,
        lastUsed: device.lastUsed,
        expiresAt: device.expiresAt,
        isCurrent: device.deviceId === crypto.createHash('sha256')
          .update(req.get('User-Agent') + req.ip)
          .digest('hex')
      }));

    res.json({ devices });
  } catch (error) {
    console.error('Get trusted devices error:', error);
    res.status(500).json({ error: 'Failed to fetch trusted devices' });
  }
});

router.delete('/trusted-devices/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user.userId;
    
    const mfa = await MFA.findOne({ user: userId });
    if (!mfa) {
      return res.status(404).json({ error: 'MFA not found' });
    }

    const device = mfa.trustedDevices.find(d => d.deviceId === deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.isActive = false;
    await mfa.save();

    res.json({ message: 'Trusted device removed successfully' });
  } catch (error) {
    console.error('Remove trusted device error:', error);
    res.status(500).json({ error: 'Failed to remove trusted device' });
  }
});

module.exports = router;