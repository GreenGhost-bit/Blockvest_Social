const express = require('express');
const Notification = require('../models/Notification');
const { authenticateToken } = require('./auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, category } = req.query;
    const userId = req.user.userId;

    const query = { recipient: userId };
    
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    if (category) {
      query.category = category;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'profile.name walletAddress')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      notifications: notifications.map(notification => ({
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: notification.read,
        readAt: notification.readAt,
        priority: notification.priority,
        category: notification.category,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
        sender: notification.sender ? {
          name: notification.sender.profile.name,
          walletAddress: notification.sender.walletAddress
        } : null
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({ _id: id, recipient: userId });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({
      message: 'Notification marked as read',
      notification: {
        id: notification._id,
        read: notification.read,
        readAt: notification.readAt
      }
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await Notification.markAllAsRead(userId);

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndDelete({ 
      _id: id, 
      recipient: userId 
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { recipientId, type, title, message, data, priority, category, actionUrl } = req.body;
    const senderId = req.user.userId;

    const notification = await Notification.createNotification({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
      data,
      priority: priority || 'medium',
      category: category || 'system',
      actionUrl
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification: {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        createdAt: notification.createdAt
      }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const categories = await Notification.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
      { 
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get notification categories error:', error);
    res.status(500).json({ error: 'Failed to get notification categories' });
  }
});

module.exports = router;