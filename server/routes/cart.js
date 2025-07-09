import express from 'express';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
import Package from '../models/Package.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate('items.book', 'title coverImage price author')
      .populate('items.package', 'name basePrice features');

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching cart' });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { type, book, package: packageId, quantity = 1, packageCustomizations } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    let price = 0;
    if (type === 'book') {
      const bookDoc = await Book.findById(book);
      if (!bookDoc) {
        return res.status(404).json({ message: 'Book not found' });
      }
      price = bookDoc.price;
    } else if (type === 'package') {
      const packageDoc = await Package.findById(packageId);
      if (!packageDoc) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      price = packageDoc.basePrice;
      
      // Calculate add-on costs
      if (packageCustomizations) {
        const { printedCopies = 0, totalPages = 100 } = packageCustomizations;
        
        if (printedCopies > packageDoc.addOns.printedCopies.baseQuantity) {
          const extraCopies = printedCopies - packageDoc.addOns.printedCopies.baseQuantity;
          price += extraCopies * packageDoc.addOns.printedCopies.pricePerUnit;
        }
        
        if (totalPages > packageDoc.addOns.extraPages.basePagesIncluded) {
          const extraPages = totalPages - packageDoc.addOns.extraPages.basePagesIncluded;
          price += extraPages * packageDoc.addOns.extraPages.pricePerPage;
        }
      }
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => {
      if (type === 'book') {
        return item.type === 'book' && item.book?.toString() === book;
      } else {
        return item.type === 'package' && item.package?.toString() === packageId;
      }
    });

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        type,
        quantity,
        price,
        ...(type === 'book' ? { book } : { package: packageId }),
        ...(packageCustomizations && { packageCustomizations })
      };
      cart.items.push(newItem);
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate('items.book', 'title coverImage price author');
    await cart.populate('items.package', 'name basePrice features');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to cart' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    cart.calculateTotal();
    await cart.save();

    await cart.populate('items.book', 'title coverImage price author');
    await cart.populate('items.package', 'name basePrice features');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    cart.calculateTotal();
    await cart.save();

    await cart.populate('items.book', 'title coverImage price author');
    await cart.populate('items.package', 'name basePrice features');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing from cart' });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing cart' });
  }
});

export default router;