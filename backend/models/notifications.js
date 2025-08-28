const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification recipient is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid recipient ID'
    }
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        if (!v) return true;
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid sender ID'
    }
  },
  type: {
    type: String,
    enum: {
      values: [
        'investment_created',
        'investment_funded',
        'payment_received',
        'payment_overdue',
        'investment_completed',
        'investment_defaulted',
        'profile_verified',
        'reputation_updated',
        'new_message',
        'system_announcement',
        'risk_assessment_completed',
        'verification_required',
        'account_locked',
        'password_changed',
        'mfa_enabled',
        'mfa_disabled',
        'login_attempt',
        'investment_approved',
        'investment_rejected',
        'repayment_due',
        'repayment_late',
        'social_connection',
        'governance_proposal',
        'voting_reminder'
      ],
      message: 'Invalid notification type'
    },
    required: [true, 'Notification type is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Investment',
      validate: {
        validator: function(v) {
          if (!v) return true;
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: 'Invalid investment ID'
      }
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      validate: {
        validator: function(v) {
          if (!v) return true;
          return v >= 0 && v <= 1000000;
        },
        message: 'Amount must be between 0 and 1,000,000'
      }
    },
    transactionId: {
      type: String,
      trim: true,
      maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^[A-Z2-7]{52}$/.test(v) || /^[a-f0-9]{64}$/.test(v);
        },
        message: 'Invalid transaction ID format'
      }
    },
    additionalInfo: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // Ensure additional info is not too large
          return JSON.stringify(v).length <= 5000;
        },
        message: 'Additional info is too large (max 5KB)'
      }
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v <= new Date();
      },
      message: 'Read timestamp cannot be in the future'
    }
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Invalid priority level'
    },
    default: 'medium'
  },
  category: {
    type: String,
    enum: {
      values: ['investment', 'payment', 'system', 'social', 'security', 'governance', 'verification'],
      message: 'Invalid notification category'
    },
    default: 'system'
  },
  actionUrl: {
    type: String,
    trim: true,
    maxlength: [500, 'Action URL cannot exceed 500 characters'],
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^https?:\/\/.+/.test(v) || /^\/.+/.test(v);
      },
      message: 'Action URL must be a valid URL or relative path'
    }
  },
  expiresAt: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true;
        return v > new Date();
      },
      message: 'Expiration date must be in the future'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Creation date cannot be in the future'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set default expiration for urgent notifications
notificationSchema.pre('save', function(next) {
  if (this.priority === 'urgent' && !this.expiresAt) {
    // Urgent notifications expire in 24 hours
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  if (this.type === 'system_announcement' && !this.expiresAt) {
    // System announcements expire in 7 days
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Instance method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to check if notification is expired
notificationSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Instance method to check if notification is urgent
notificationSchema.methods.isUrgent = function() {
  return this.priority === 'urgent';
};

// Static method to create notification with real-time updates
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    // Send real-time notification if Socket.IO is available
    if (global.io) {
      global.io.to(`user_${notificationData.recipient}`).emit('newNotification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        category: notification.category,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  try {
    const result = await this.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );
    
    // Send real-time update
    if (global.io) {
      global.io.to(`user_${userId}`).emit('notificationsMarkedRead');
    }
    
    return result;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

// Static method to get unread notification count
notificationSchema.statics.getUnreadCount = async function(userId) {
  try {
    return await this.countDocuments({ 
      recipient: userId, 
      read: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Static method to get notifications by type
notificationSchema.statics.getByType = async function(userId, type, limit = 20) {
  try {
    return await this.find({
      recipient: userId,
      type: type,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username full_name profile_picture');
  } catch (error) {
    console.error('Error getting notifications by type:', error);
    throw error;
  }
};

// Static method to get notifications by priority
notificationSchema.statics.getByPriority = async function(userId, priority, limit = 20) {
  try {
    return await this.find({
      recipient: userId,
      priority: priority,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'username full_name profile_picture');
  } catch (error) {
    console.error('Error getting notifications by priority:', error);
    throw error;
  }
};

// Static method to clean up expired notifications
notificationSchema.statics.cleanupExpired = async function() {
  try {
    const result = await this.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired notifications`);
    return result;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};

module.exports = mongoose.model('Notification', notificationSchema);