import express from 'express';
import { body } from 'express-validator';
import Event from '../models/Event.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    };

    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// Get single event
router.get('/:slug', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug })
      .populate('organizer', 'name avatar bio')
      .populate('registeredUsers.user', 'name avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event' });
  }
});

// Register for event
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(
      reg => reg.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.maxAttendees > 0 && event.registeredUsers.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registeredUsers.push({ user: req.user.id });
    await event.save();

    // Create notification for successful registration
    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      user: req.user.id,
      type: 'event_reminder',
      title: 'Event Registration Confirmed',
      message: `You have successfully registered for "${event.title}" on ${new Date(event.startDate).toLocaleDateString()}.`,
      relatedId: event._id,
      relatedModel: 'Event',
      priority: 'medium'
    });
    res.json({ success: true, message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: 'Server error registering for event' });
  }
});

// Admin: Create event
router.post('/', protect, admin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('location').notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user.id
    });

    await event.populate('organizer', 'name');
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// Admin: Update event
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('organizer', 'name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// Admin: Delete event
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

export default router;

// Get user's event registrations
router.get('/user/registrations', protect, async (req, res) => {
  try {
    const events = await Event.find({
      'registeredUsers.user': req.user.id
    }).select('title startDate location price registeredUsers');

    const userRegistrations = events.map(event => {
      const registration = event.registeredUsers.find(
        reg => reg.user.toString() === req.user.id
      );
      
      return {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        location: event.location,
        price: event.price,
        registeredAt: registration?.registeredAt || event.createdAt
      };
    });

    res.json(userRegistrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching event registrations' });
  }
});