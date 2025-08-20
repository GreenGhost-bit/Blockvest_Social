const User = require('../models/User');
const Notification = require('../models/notifications');

class NotificationService {
  constructor(io) {
    this.io = io;
    this.deliveryChannels = {
      push: true,
      email: true,
      sms: false,
      inApp: true,
      webhook: false
    };
    
    this.notificationTemplates = this.initializeTemplates();
    this.deliveryQueue = [];
    this.retryAttempts = 3;
    this.retryDelay = 5000;
  }

  // Initialize notification templates
  initializeTemplates() {
    return {
      investment: {
        funded: {
          title: 'Investment Funded! 🎉',
          message: 'Your investment request for {amount} ALGO has been funded successfully.',
          type: 'success',
          priority: 'high',
          category: 'investment',
          actions: ['view_details', 'track_progress']
        },
        repayment: {
          title: 'Repayment Received 💰',
          message: 'Repayment of {amount} ALGO has been received and processed.',
          type: 'info',
          priority: 'medium',
          category: 'investment',
          actions: ['view_transaction', 'update_status']
        },
        default: {
          title: 'Investment Defaulted ⚠️',
          message: 'Investment {investmentId} has been marked as defaulted. Action required.',
          type: 'warning',
          priority: 'high',
          category: 'investment',
          actions: ['contact_support', 'review_terms']
        },
        completed: {
          title: 'Investment Completed ✅',
          message: 'Investment {investmentId} has been successfully completed.',
          type: 'success',
          priority: 'medium',
          category: 'investment',
          actions: ['view_summary', 'rate_experience']
        },
        liquidated: {
          title: 'Collateral Liquidated 🔒',
          message: 'Collateral for investment {investmentId} has been liquidated.',
          type: 'warning',
          priority: 'high',
          category: 'investment',
          actions: ['view_details', 'contact_support']
        }
      },
      reputation: {
        increased: {
          title: 'Reputation Boost! ⬆️',
          message: 'Your reputation increased by {change} points. Great job!',
          type: 'success',
          priority: 'medium',
          category: 'reputation',
          actions: ['view_profile', 'share_achievement']
        },
        decreased: {
          title: 'Reputation Update ⬇️',
          message: 'Your reputation decreased by {change} points. Reason: {reason}',
          type: 'warning',
          priority: 'medium',
          category: 'reputation',
          actions: ['view_details', 'improve_score']
        }
      },
      verification: {
        verified: {
          title: 'Account Verified! ✅',
          message: 'Your account has been verified successfully. You now have access to all features.',
          type: 'success',
          priority: 'high',
          category: 'verification',
          actions: ['explore_features', 'complete_profile']
        },
        rejected: {
          title: 'Verification Rejected ❌',
          message: 'Your verification was rejected. Please check the requirements and resubmit.',
          type: 'warning',
          priority: 'high',
          category: 'verification',
          actions: ['view_requirements', 'resubmit']
        },
        suspended: {
          title: 'Account Suspended 🚫',
          message: 'Your account has been suspended. Contact support for details.',
          type: 'error',
          priority: 'critical',
          category: 'verification',
          actions: ['contact_support', 'appeal_decision']
        }
      },
      system: {
        announcement: {
          title: 'System Announcement 📢',
          message: '{message}',
          type: 'info',
          priority: 'medium',
          category: 'system',
          actions: ['dismiss', 'learn_more']
        },
        maintenance: {
          title: 'Scheduled Maintenance 🔧',
          message: 'System maintenance scheduled for {date}. Expected downtime: {duration}.',
          type: 'warning',
          priority: 'high',
          category: 'system',
          actions: ['view_schedule', 'set_reminder']
        }
      },
      reminder: {
        payment_due: {
          title: 'Payment Due Soon ⏰',
          message: 'Payment of {amount} ALGO is due in {daysLeft} days.',
          type: 'warning',
          priority: 'high',
          category: 'reminder',
          actions: ['make_payment', 'extend_deadline']
        },
        risk_assessment: {
          title: 'Risk Assessment Due 📊',
          message: 'Your risk assessment is due for renewal. Complete it to maintain access.',
          type: 'info',
          priority: 'medium',
          category: 'reminder',
          actions: ['complete_assessment', 'schedule_later']
        },
        verification_expiry: {
          title: 'Verification Expiring ⏳',
          message: 'Your verification documents will expire in {daysLeft} days.',
          type: 'warning',
          priority: 'high',
          category: 'reminder',
          actions: ['renew_verification', 'view_documents']
        }
      }
    };
  }

  // Enhanced send notification to specific user with multiple channels
  async sendToUser(userId, notification, channels = null) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User ${userId} not found for notification`);
        return false;
      }

      // Get user's preferred channels
      const userChannels = channels || user.preferences?.notifications || this.deliveryChannels;
      
      // Create notification record
      const notificationRecord = new Notification({
        userId: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'medium',
        category: notification.category || 'general',
        actions: notification.actions || [],
        channels: userChannels,
        status: 'pending',
        createdAt: new Date()
      });

      await notificationRecord.save();

      // Send through different channels
      const deliveryResults = await this.deliverNotification(notificationRecord, user, userChannels);
      
      // Update notification status
      notificationRecord.status = deliveryResults.success ? 'delivered' : 'failed';
      notificationRecord.deliveryResults = deliveryResults;
      await notificationRecord.save();

      return deliveryResults.success;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Enhanced send notification to multiple users with batching
  async sendToUsers(userIds, notification, channels = null) {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(userId => this.sendToUser(userId, notification, channels))
      );
      results.push(...batchResults);
      
      // Add delay between batches to avoid overwhelming the system
      if (i + batchSize < userIds.length) {
        await this.delay(100);
      }
    }
    
    return results.filter(Boolean).length;
  }

  // Deliver notification through multiple channels
  async deliverNotification(notificationRecord, user, channels) {
    const results = {
      success: false,
      channels: {},
      errors: []
    };

    try {
      // In-app notification (Socket.IO)
      if (channels.inApp) {
        try {
          this.io.to(`user_${user._id}`).emit('notification', {
            id: notificationRecord._id,
            title: notificationRecord.title,
            message: notificationRecord.message,
            type: notificationRecord.type,
            priority: notificationRecord.priority,
            category: notificationRecord.category,
            actions: notificationRecord.actions,
            timestamp: notificationRecord.createdAt,
            read: false
          });
          results.channels.inApp = { success: true, timestamp: new Date() };
        } catch (error) {
          results.channels.inApp = { success: false, error: error.message };
          results.errors.push(`In-app delivery failed: ${error.message}`);
        }
      }

      // Push notification
      if (channels.push && user.pushToken) {
        try {
          await this.sendPushNotification(user.pushToken, notificationRecord);
          results.channels.push = { success: true, timestamp: new Date() };
        } catch (error) {
          results.channels.push = { success: false, error: error.message };
          results.errors.push(`Push notification failed: ${error.message}`);
        }
      }

      // Email notification
      if (channels.email && user.email) {
        try {
          await this.sendEmailNotification(user.email, notificationRecord);
          results.channels.email = { success: true, timestamp: new Date() };
        } catch (error) {
          results.channels.email = { success: false, error: error.message };
          results.errors.push(`Email delivery failed: ${error.message}`);
        }
      }

      // SMS notification
      if (channels.sms && user.phone) {
        try {
          await this.sendSMSNotification(user.phone, notificationRecord);
          results.channels.sms = { success: true, timestamp: new Date() };
        } catch (error) {
          results.channels.sms = { success: false, error: error.message };
          results.errors.push(`SMS delivery failed: ${error.message}`);
        }
      }

      // Webhook notification
      if (channels.webhook && user.webhookUrl) {
        try {
          await this.sendWebhookNotification(user.webhookUrl, notificationRecord);
          results.channels.webhook = { success: true, timestamp: new Date() };
        } catch (error) {
          results.channels.webhook = { success: false, error: error.message };
          results.errors.push(`Webhook delivery failed: ${error.message}`);
        }
      }

      // Determine overall success
      results.success = Object.values(results.channels).some(channel => channel.success);
      
      return results;
    } catch (error) {
      results.errors.push(`General delivery error: ${error.message}`);
      return results;
    }
  }

  // Enhanced investment notifications with smart templating
  async sendInvestmentNotification(investmentId, type, data) {
    const template = this.notificationTemplates.investment[type];
    if (!template) {
      console.error(`Unknown investment notification type: ${type}`);
      return false;
    }

    // Replace template variables
    const notification = {
      title: this.replaceTemplateVariables(template.title, data),
      message: this.replaceTemplateVariables(template.message, data),
      type: template.type,
      priority: template.priority,
      category: template.category,
      actions: template.actions,
      metadata: {
        investmentId: investmentId,
        ...data
      }
    };

    return await this.sendToUser(data.userId, notification);
  }

  // Enhanced reputation notifications
  async sendReputationNotification(userId, change, reason) {
    const templateType = change > 0 ? 'increased' : 'decreased';
    const template = this.notificationTemplates.reputation[templateType];
    
    const notification = {
      title: this.replaceTemplateVariables(template.title, { change: Math.abs(change) }),
      message: this.replaceTemplateVariables(template.message, { change: Math.abs(change), reason }),
      type: template.type,
      priority: template.priority,
      category: template.category,
      actions: template.actions,
      metadata: {
        change: change,
        reason: reason,
        timestamp: new Date()
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Enhanced verification notifications
  async sendVerificationNotification(userId, status) {
    const template = this.notificationTemplates.verification[status];
    if (!template) {
      console.error(`Unknown verification status: ${status}`);
      return false;
    }

    const notification = {
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      category: template.category,
      actions: template.actions,
      metadata: {
        status: status,
        timestamp: new Date()
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Enhanced system announcements with targeting
  async sendSystemAnnouncement(message, type = 'info', targetUsers = null) {
    const template = this.notificationTemplates.system.announcement;
    
    const notification = {
      title: template.title,
      message: this.replaceTemplateVariables(template.message, { message }),
      type: template.type,
      priority: template.priority,
      category: template.category,
      actions: template.actions,
      system: true,
      metadata: {
        announcementType: type,
        timestamp: new Date()
      }
    };

    if (targetUsers) {
      return await this.sendToUsers(targetUsers, notification);
    } else {
      this.io.emit('system_notification', notification);
      return true;
    }
  }

  // Enhanced reminder notifications with smart scheduling
  async sendReminderNotification(userId, type, data) {
    const template = this.notificationTemplates.reminder[type];
    if (!template) {
      console.error(`Unknown reminder type: ${type}`);
      return false;
    }

    const notification = {
      title: this.replaceTemplateVariables(template.title, data),
      message: this.replaceTemplateVariables(template.message, data),
      type: template.type,
      priority: template.priority,
      category: template.category,
      actions: template.actions,
      metadata: {
        reminderType: type,
        ...data,
        timestamp: new Date()
      }
    };

    return await this.sendToUser(userId, notification);
  }

  // Smart notification scheduling based on user behavior
  async scheduleSmartNotification(userId, notification, optimalTime = null) {
    try {
      const user = await User.findById(userId);
      if (!user) return false;

      // Calculate optimal delivery time based on user behavior
      const deliveryTime = optimalTime || this.calculateOptimalDeliveryTime(user);
      
      // Schedule the notification
      const scheduledNotification = new Notification({
        userId: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        actions: notification.actions,
        scheduledFor: deliveryTime,
        status: 'scheduled',
        createdAt: new Date()
      });

      await scheduledNotification.save();
      
      // Set timeout to deliver at optimal time
      const delay = deliveryTime.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(async () => {
          await this.deliverScheduledNotification(scheduledNotification._id);
        }, delay);
      }

      return true;
    } catch (error) {
      console.error('Error scheduling smart notification:', error);
      return false;
    }
  }

  // Calculate optimal delivery time based on user behavior
  calculateOptimalDeliveryTime(user) {
    const now = new Date();
    const userTimezone = user.preferences?.timezone || 'UTC';
    
    // Default to 9 AM in user's timezone
    const optimalHour = user.preferences?.optimalNotificationHour || 9;
    const optimalTime = new Date(now);
    optimalTime.setHours(optimalHour, 0, 0, 0);
    
    // If optimal time has passed today, schedule for tomorrow
    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }
    
    return optimalTime;
  }

  // Deliver scheduled notification
  async deliverScheduledNotification(notificationId) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification || notification.status !== 'scheduled') return;

      const user = await User.findById(notification.userId);
      if (!user) return;

      // Update status and deliver
      notification.status = 'pending';
      await notification.save();

      await this.deliverNotification(notification, user, user.preferences?.notifications || this.deliveryChannels);
    } catch (error) {
      console.error('Error delivering scheduled notification:', error);
    }
  }

  // Replace template variables in notification text
  replaceTemplateVariables(text, data) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // Send push notification
  async sendPushNotification(pushToken, notification) {
    // This would integrate with FCM, APNS, or other push services
    console.log(`Push notification sent to ${pushToken}: ${notification.title}`);
    return true;
  }

  // Send email notification
  async sendEmailNotification(email, notification) {
    // This would integrate with email service providers
    console.log(`Email notification sent to ${email}: ${notification.title}`);
    return true;
  }

  // Send SMS notification
  async sendSMSNotification(phone, notification) {
    // This would integrate with SMS service providers
    console.log(`SMS notification sent to ${phone}: ${notification.title}`);
    return true;
  }

  // Send webhook notification
  async sendWebhookNotification(webhookUrl, notification) {
    // This would send HTTP POST to webhook URL
    console.log(`Webhook notification sent to ${webhookUrl}: ${notification.title}`);
    return true;
  }

  // Enhanced get user notifications with pagination and filtering
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        category = null,
        type = null,
        read = null,
        startDate = null,
        endDate = null
      } = options;

      let query = { userId: userId };

      if (category) query.category = category;
      if (type) query.type = type;
      if (read !== null) query.read = read;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1, priority: -1 })
        .skip(offset)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return { notifications: [], pagination: { total: 0, limit, offset, hasMore: false } };
    }
  }

  // Enhanced mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    try {
      const result = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: userId },
        { read: true, readAt: new Date() },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark multiple notifications as read
  async markNotificationsAsRead(userId, notificationIds) {
    try {
      const result = await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: userId },
        { read: true, readAt: new Date() }
      );
      return result.modifiedCount;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return 0;
    }
  }

  // Enhanced clear old notifications
  async clearOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        userId: userId,
        createdAt: { $lt: cutoffDate },
        read: true
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      return 0;
    }
  }

  // Get notification statistics for user
  async getNotificationStats(userId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
            byCategory: {
              $push: {
                category: '$category',
                count: 1
              }
            },
            byType: {
              $push: {
                type: '$type',
                count: 1
              }
            }
          }
        }
      ]);

      return stats[0] || { total: 0, unread: 0, byCategory: [], byType: [] };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { total: 0, unread: 0, byCategory: [], byType: [] };
    }
  }

  // Utility delay function
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = NotificationService; 