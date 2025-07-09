import express from 'express';
import Notification from '../models/Notification.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notification' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating notifications' });
  }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting notification' });
  }
});

// Admin: Create notification
router.post('/', protect, admin, async (req, res) => {
  try {
    const { users, type, title, message, priority = 'medium' } = req.body;

    const notifications = users.map(userId => ({
      user: userId,
      type,
      title,
      message,
      priority
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({ success: true, message: 'Notifications sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating notifications' });
  }
});

export default router;