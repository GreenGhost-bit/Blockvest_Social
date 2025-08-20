const User = require('../models/User');
const NotificationService = require('./notificationService');
const crypto = require('crypto');

class VerificationService {
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
    this.verificationLevels = {
      basic: { requirements: ['email', 'phone'], maxAmount: 1000 },
      enhanced: { requirements: ['email', 'phone', 'id_document', 'address_proof'], maxAmount: 10000 },
      premium: { requirements: ['email', 'phone', 'id_document', 'address_proof', 'income_proof', 'employment_verification'], maxAmount: 100000 }
    };
  }

  async initiateVerification(userId, level = 'basic') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!this.verificationLevels[level]) {
        throw new Error('Invalid verification level');
      }

      const requirements = this.verificationLevels[level].requirements;
      const verificationId = this.generateVerificationId();

      const verificationData = {
        level,
        status: 'pending',
        requirements,
        verification_id: verificationId,
        initiated_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        documents: [],
        verification_notes: []
      };

      await User.findByIdAndUpdate(userId, {
        $set: {
          verification_status: 'pending',
          kyc_level: level,
          verification_data: verificationData
        }
      });

      // Send notification
      await this.notificationService.sendToUser(userId, {
        type: 'verification_initiated',
        title: 'Verification Initiated',
        message: `Your ${level} verification has been initiated. Please complete the required steps.`,
        data: {
          level,
          requirements,
          verificationId,
          expiresAt: verificationData.expires_at
        }
      });

      return {
        success: true,
        verificationId,
        level,
        requirements,
        expiresAt: verificationData.expires_at
      };
    } catch (error) {
      console.error('Error initiating verification:', error);
      throw error;
    }
  }

  async submitDocument(userId, documentType, documentData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.verification_data || user.verification_data.status === 'completed') {
        throw new Error('No active verification found');
      }

      const document = {
        type: documentType,
        data: documentData,
        submitted_at: new Date(),
        status: 'pending',
        document_id: this.generateDocumentId()
      };

      await User.findByIdAndUpdate(userId, {
        $push: {
          'verification_data.documents': document
        }
      });

      // Auto-verify certain document types
      if (['email', 'phone'].includes(documentType)) {
        await this.autoVerifyDocument(userId, documentType);
      }

      return {
        success: true,
        documentId: document.document_id,
        type: documentType,
        status: document.status
      };
    } catch (error) {
      console.error('Error submitting document:', error);
      throw error;
    }
  }

  async autoVerifyDocument(userId, documentType) {
    try {
      if (documentType === 'email') {
        await User.findByIdAndUpdate(userId, {
          $set: { email_verified: true },
          $push: {
            'verification_data.verification_notes': {
              note: 'Email automatically verified',
              timestamp: new Date(),
              type: 'auto_verification'
            }
          }
        });
      } else if (documentType === 'phone') {
        await User.findByIdAndUpdate(userId, {
          $set: { phone_verified: true },
          $push: {
            'verification_data.verification_notes': {
              note: 'Phone automatically verified',
              timestamp: new Date(),
              type: 'auto_verification'
            }
          }
        });
      }

      await this.checkVerificationCompletion(userId);
    } catch (error) {
      console.error('Error auto-verifying document:', error);
    }
  }

  async verifyDocument(userId, documentId, status, notes = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.verification_data) {
        throw new Error('No verification data found');
      }

      const document = user.verification_data.documents.find(
        doc => doc.document_id === documentId
      );

      if (!document) {
        throw new Error('Document not found');
      }

      // Update document status
      await User.findByIdAndUpdate(userId, {
        $set: {
          'verification_data.documents.$[elem].status': status,
          'verification_data.documents.$[elem].verified_at': new Date(),
          'verification_data.documents.$[elem].verifier_notes': notes
        }
      }, {
        arrayFilters: [{ 'elem.document_id': documentId }]
      });

      // Add verification note
      await User.findByIdAndUpdate(userId, {
        $push: {
          'verification_data.verification_notes': {
            note: `Document ${documentType} ${status}`,
            timestamp: new Date(),
            type: 'manual_verification',
            details: notes
          }
        }
      });

      // Check if verification is complete
      await this.checkVerificationCompletion(userId);

      // Send notification
      await this.notificationService.sendToUser(userId, {
        type: 'document_verified',
        title: 'Document Verified',
        message: `Your ${document.type} document has been ${status}`,
        data: {
          documentType: document.type,
          status,
          notes
        }
      });

      return {
        success: true,
        documentId,
        status,
        notes
      };
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  }

  async checkVerificationCompletion(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.verification_data) {
        return false;
      }

      const { level, requirements, documents } = user.verification_data;
      const levelRequirements = this.verificationLevels[level].requirements;

      // Check if all required documents are verified
      const verifiedDocuments = documents.filter(doc => doc.status === 'verified');
      const verifiedTypes = verifiedDocuments.map(doc => doc.type);

      const allRequirementsMet = levelRequirements.every(req => {
        if (req === 'email') return user.email_verified;
        if (req === 'phone') return user.phone_verified;
        return verifiedTypes.includes(req);
      });

      if (allRequirementsMet) {
        await this.completeVerification(userId, level);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking verification completion:', error);
      return false;
    }
  }

  async completeVerification(userId, level) {
    try {
      const maxAmount = this.verificationLevels[level].maxAmount;

      await User.findByIdAndUpdate(userId, {
        $set: {
          verification_status: 'verified',
          verification_verified_at: new Date(),
          'verification_data.status': 'completed',
          'verification_data.completed_at': new Date(),
          max_investment_amount: maxAmount
        }
      });

      // Send notification
      await this.notificationService.sendToUser(userId, {
        type: 'verification_completed',
        title: 'Verification Completed',
        message: `Your ${level} verification has been completed successfully!`,
        data: {
          level,
          maxAmount,
          completedAt: new Date()
        }
      });

      return {
        success: true,
        level,
        maxAmount,
        completedAt: new Date()
      };
    } catch (error) {
      console.error('Error completing verification:', error);
      throw error;
    }
  }

  async rejectVerification(userId, reason) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          verification_status: 'rejected',
          verification_rejected_at: new Date(),
          'verification_data.status': 'rejected',
          'verification_data.rejected_at': new Date(),
          'verification_data.rejection_reason': reason
        },
        $push: {
          'verification_data.verification_notes': {
            note: `Verification rejected: ${reason}`,
            timestamp: new Date(),
            type: 'rejection',
            details: reason
          }
        }
      });

      // Send notification
      await this.notificationService.sendToUser(userId, {
        type: 'verification_rejected',
        title: 'Verification Rejected',
        message: `Your verification has been rejected. Reason: ${reason}`,
        data: {
          reason,
          rejectedAt: new Date()
        }
      });

      return {
        success: true,
        reason,
        rejectedAt: new Date()
      };
    } catch (error) {
      console.error('Error rejecting verification:', error);
      throw error;
    }
  }

  async getVerificationStatus(userId) {
    try {
      const user = await User.findById(userId)
        .select('verification_status kyc_level verification_data email_verified phone_verified');

      if (!user) {
        throw new Error('User not found');
      }

      const verificationData = user.verification_data || {};
      const level = user.kyc_level || 'basic';
      const levelRequirements = this.verificationLevels[level]?.requirements || [];

      const status = {
        userId,
        verificationStatus: user.verification_status || 'unverified',
        kycLevel: level,
        emailVerified: user.email_verified || false,
        phoneVerified: user.phone_verified || false,
        requirements: levelRequirements,
        documents: verificationData.documents || [],
        notes: verificationData.verification_notes || [],
        initiatedAt: verificationData.initiated_at,
        expiresAt: verificationData.expires_at,
        completedAt: verificationData.completed_at,
        rejectedAt: verificationData.rejected_at,
        rejectionReason: verificationData.rejection_reason
      };

      return status;
    } catch (error) {
      console.error('Error getting verification status:', error);
      throw error;
    }
  }

  async updateVerificationLevel(userId, newLevel) {
    try {
      if (!this.verificationLevels[newLevel]) {
        throw new Error('Invalid verification level');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // If user has a higher level, they can't downgrade
      if (user.kyc_level && this.getLevelPriority(user.kyc_level) > this.getLevelPriority(newLevel)) {
        throw new Error('Cannot downgrade verification level');
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          kyc_level: newLevel,
          'verification_data.level': newLevel,
          'verification_data.updated_at': new Date()
        }
      });

      return {
        success: true,
        newLevel,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating verification level:', error);
      throw error;
    }
  }

  async getVerificationHistory(userId) {
    try {
      const user = await User.findById(userId)
        .select('verification_data');

      if (!user || !user.verification_data) {
        return [];
      }

      return user.verification_data.verification_notes || [];
    } catch (error) {
      console.error('Error getting verification history:', error);
      throw error;
    }
  }

  async getPendingVerifications(limit = 50) {
    try {
      const users = await User.find({
        'verification_data.status': 'pending'
      })
      .select('first_name last_name email kyc_level verification_data.initiated_at')
      .sort({ 'verification_data.initiated_at': 1 })
      .limit(limit);

      return users.map(user => ({
        userId: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        level: user.kyc_level,
        initiatedAt: user.verification_data.initiated_at
      }));
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      throw error;
    }
  }

  getLevelPriority(level) {
    const priorities = { basic: 1, enhanced: 2, premium: 3 };
    return priorities[level] || 0;
  }

  generateVerificationId() {
    return `ver_${crypto.randomBytes(16).toString('hex')}`;
  }

  generateDocumentId() {
    return `doc_${crypto.randomBytes(16).toString('hex')}`;
  }

  async cleanupExpiredVerifications() {
    try {
      const expiredUsers = await User.find({
        'verification_data.expires_at': { $lt: new Date() },
        'verification_data.status': 'pending'
      });

      for (const user of expiredUsers) {
        await this.rejectVerification(user._id, 'Verification expired');
      }

      return {
        success: true,
        cleanedCount: expiredUsers.length
      };
    } catch (error) {
      console.error('Error cleaning up expired verifications:', error);
      throw error;
    }
  }
}

module.exports = VerificationService;
