import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user's orders
router.get('/user', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map(item => ({
        type: item.type,
        title: item.title || 'Unknown Item',
        price: item.price,
        quantity: item.quantity
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Create order from cart
router.post('/create', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.book', 'title')
      .populate('items.package', 'name')
      .populate('items.event', 'title');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: cart.items.map(item => ({
        type: item.type,
        book: item.book?._id,
        package: item.package?._id,
        event: item.event?._id,
        quantity: item.quantity,
        price: item.price,
        title: item.type === 'book' ? item.book?.title : 
               item.type === 'event' ? item.event?.title : 
               item.package?.name,
        packageCustomizations: item.packageCustomizations
      })),
      totalAmount: cart.totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Process event registrations
    for (const item of cart.items) {
      if (item.type === 'event') {
        const event = await Event.findById(item.event._id);
        if (event) {
          const alreadyRegistered = event.registeredUsers.some(
            reg => reg.user.toString() === req.user.id
          );
          
          if (!alreadyRegistered) {
            event.registeredUsers.push({ user: req.user.id });
            await event.save();
          }
        }
      }
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating order' });
  }
});

export default router;