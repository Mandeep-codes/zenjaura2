import express from 'express';
import Pkg from '../models/Package.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all packages
router.get('/', async (req, res) => {
  try {
    const pkgs = await Pkg.find({ isActive: true }).sort({ basePrice: 1 });
    res.json(pkgs);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching packages' });
  }
});

// Get single package
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Pkg.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching package' });
  }
});

// Admin: Create package
router.post('/', protect, admin, async (req, res) => {
  try {
    const pkg = await Pkg.create(req.body);
    res.status(201).json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating package' });
  }
});

// Admin: Update package
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const pkg = await Pkg.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    res.json({ success: true, package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating package' });
  }
});

export default router;
