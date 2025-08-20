const User = require('../models/User');

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to specific user
  async sendToUser(userId, notification) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User ${userId} not found for notification`);
        return false;
      }

      // Check user notification preferences
      if (!user.preferences?.notifications?.push) {
        return false;
      }

      this.io.to(`user_${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date(),
        id: this.generateNotificationId()
      });

      return true;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return false;
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds, notification) {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );
    return results.filter(Boolean).length;
  }

  // Send investment-related notifications
  async sendInvestmentNotification(investmentId, type, data) {
    const notifications = {
      funded: {
        title: 'Investment Funded!',
        message: `Your investment request for ${data.amount} ALGO has been funded.`,
        type: 'success'
      },
      repayment: {
        title: 'Repayment Received',
        message: `Repayment of ${data.amount} ALGO has been received.`,
        type: 'info'
      },
      default: {
        title: 'Investment Defaulted',
        message: `Investment ${investmentId} has been marked as defaulted.`,
        type: 'warning'
      },
      completed: {
        title: 'Investment Completed',
        message: `Investment ${investmentId} has been successfully completed.`,
        type: 'success'
      }
    };

    const notification = notifications[type];
    if (notification) {
      await this.sendToUser(data.userId, notification);
    }
  }

  // Send reputation change notification
  async sendReputationNotification(userId, change, reason) {
    const notification = {
      title: 'Reputation Updated',
      message: `Your reputation ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} points. Reason: ${reason}`,
      type: change > 0 ? 'success' : 'warning'
    };

    await this.sendToUser(userId, notification);
  }

  // Send verification status notification
  async sendVerificationNotification(userId, status) {
    const messages = {
      verified: 'Your account has been verified successfully!',
      rejected: 'Your verification was rejected. Please check the requirements.',
      suspended: 'Your account has been suspended. Contact support for details.'
    };

    const notification = {
      title: 'Verification Status Update',
      message: messages[status] || 'Your verification status has been updated.',
      type: status === 'verified' ? 'success' : 'warning'
    };

    await this.sendToUser(userId, notification);
  }

  // Send system-wide announcements
  async sendSystemAnnouncement(message, type = 'info') {
    const notification = {
      title: 'System Announcement',
      message,
      type,
      system: true
    };

    this.io.emit('system_notification', notification);
  }

  // Send reminder notifications
  async sendReminderNotification(userId, type, data) {
    const reminders = {
      payment_due: {
        title: 'Payment Due Soon',
        message: `Payment of ${data.amount} ALGO is due in ${data.daysLeft} days.`,
        type: 'warning'
      },
      risk_assessment: {
        title: 'Risk Assessment Due',
        message: 'Your risk assessment is due for renewal.',
        type: 'info'
      },
      verification_expiry: {
        title: 'Verification Expiring',
        message: 'Your verification documents will expire soon.',
        type: 'warning'
      }
    };

    const notification = reminders[type];
    if (notification) {
      await this.sendToUser(userId, notification);
    }
  }

  // Generate unique notification ID
  generateNotificationId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get user's notification history
  async getUserNotifications(userId, limit = 50) {
    try {
      const user = await User.findById(userId);
      if (!user) return [];

      // This would typically come from a separate notifications collection
      // For now, return empty array as placeholder
      return [];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(userId, notificationId) {
    try {
      // This would typically update a notifications collection
      // For now, just return success as placeholder
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Clear old notifications
  async clearOldNotifications(userId, daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // This would typically delete from a notifications collection
      // For now, just return success as placeholder
      return true;
    } catch (error) {
      console.error('Error clearing old notifications:', error);
      return false;
    }
  }
}

module.exports = NotificationService; 