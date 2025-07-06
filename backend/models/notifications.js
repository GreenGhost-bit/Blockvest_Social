const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: [
      'investment_created',
      'investment_funded',
      'payment_received',
      'payment_overdue',
      'investment_completed',
      'investment_defaulted',
      'profile_verified',
      'reputation_updated',
      'new_message',
      'system_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    investmentId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    transactionId: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['investment', 'payment', 'system', 'social', 'security'],
    default: 'system'
  },
  actionUrl: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  
  if (global.io) {
    global.io.to(`user_${notificationData.recipient}`).emit('newNotification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: notification.priority,
      createdAt: notification.createdAt
    });
  }
  
  return notification;
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  const result = await this.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
  
  if (global.io) {
    global.io.to(`user_${userId}`).emit('notificationsMarkedRead');
  }
  
  return result;
};

notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);