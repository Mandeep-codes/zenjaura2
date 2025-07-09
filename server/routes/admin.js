import express from 'express';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Event from '../models/Event.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/auth.js';
dotenv.config();
const router = express.Router();

// Dashboard stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBooks = await Book.countDocuments();
    const publishedBooks = await Book.countDocuments({ status: 'published' });
    const pendingBooks = await Book.countDocuments({ status: 'pending' });
    const totalEvents = await Event.countDocuments();
    const totalOrders = await Order.countDocuments();

    const recentBooks = await Book.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalBooks,
        publishedBooks,
        pendingBooks,
        totalEvents,
        totalOrders
      },
      recentBooks,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Update user status
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { isVerified } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Analytics data
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    // Monthly user registrations
    const userRegistrations = await User.aggregate([
      {
        $match: { role: 'user' }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Book submissions by status
    const booksByStatus = await Book.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular genres
    const popularGenres = await Book.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      userRegistrations,
      booksByStatus,
      popularGenres
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

export default router;