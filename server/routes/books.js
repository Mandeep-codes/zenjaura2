import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, admin } from '../middleware/auth.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenjaura/books',
    allowed_formats: ['jpg', 'png', 'pdf'],
    resource_type: 'auto'
  }
});

const upload = multer({ storage });

// Get all books with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    let query = { status: 'published', isActive: true };
    
    if (req.query.genre) {
      query.genre = req.query.genre;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { synopsis: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.featured === 'true') {
      query = { status: 'published', isActive: true };
    }

    const books = await Book.find(query)
      .populate('author', 'name')
      .populate('coAuthors', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching books' });
  }
});

// Get book stats
router.get('/stats', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments({ status: 'published' });
    const totalAuthors = await User.countDocuments({ role: 'user' });
    
    const books = await Book.find({ status: 'published' });
    const averageRating = books.reduce((acc, book) => acc + book.rating.average, 0) / books.length || 0;
    const totalSales = books.reduce((acc, book) => acc + book.sales.totalSold, 0);

    res.json({
      totalBooks,
      totalAuthors,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSales
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

// Get single book by slug
router.get('/:slug', async (req, res) => {
  try {
    const book = await Book.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name avatar bio')
      .populate('coAuthors', 'name avatar')
      .populate('reviews.user', 'name avatar');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching book' });
  }
});

// ✅ Updated: Submit book for publishing (protected)
router.post(
  '/submit',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'manuscriptFile', maxCount: 1 }
  ]),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('synopsis').notEmpty().withMessage('Synopsis is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('publishingPackage').notEmpty().withMessage('Publishing package is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, synopsis, genre, publishingPackage, tags, coAuthors } = req.body;

      if (!req.files?.coverImage || !req.files?.manuscriptFile) {
        return res.status(400).json({ message: 'Cover image and manuscript file are required' });
      }

      let parsedTags = [];
      let parsedCoAuthors = [];

      try {
        parsedTags = tags ? JSON.parse(tags) : [];
        parsedCoAuthors = coAuthors ? JSON.parse(coAuthors) : [];
      } catch (err) {
        return res.status(400).json({ message: 'Invalid JSON format for tags or coAuthors' });
      }

      const book = await Book.create({
        title,
        synopsis,
        genre,
        author: req.user.id,
        coAuthors: parsedCoAuthors,
        coverImage: req.files.coverImage[0].path,
        manuscriptFile: req.files.manuscriptFile[0].path,
        publishingPackage,
        tags: parsedTags,
        price: 0,
        status: 'pending'
      });

      await book.populate('author', 'name');

      res.status(201).json({ success: true, book });
    } catch (error) {
      console.error('❌ Error submitting book:', error);
      res.status(500).json({ message: 'Server error submitting book' });
    }
  }
);

// Get user's submitted books
router.get('/user/submissions', protect, async (req, res) => {
  try {
    const books = await Book.find({ 
      $or: [
        { author: req.user.id },
        { coAuthors: req.user.id }
      ]
    })
    .populate('author', 'name')
    .populate('coAuthors', 'name')
    .populate('publishingPackage', 'name')
    .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
});

// Admin routes
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const books = await Book.find()
      .populate('author', 'name email')
      .populate('coAuthors', 'name')
      .populate('publishingPackage', 'name')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching books' });
  }
});

router.put('/admin/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, adminFeedback, price } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { status, adminFeedback, ...(price && { price }) },
      { new: true }
    ).populate('author', 'name email');

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ success: true, book });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating book status' });
  }
});

export default router;
