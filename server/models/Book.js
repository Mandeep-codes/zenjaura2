import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coAuthors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  synopsis: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Poetry', 'Children', 'Other']
  },
  coverImage: {
    type: String,
    required: true
  },
  manuscriptFile: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'published'],
    default: 'pending'
  },
  publishingPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  versions: [{
    version: Number,
    manuscriptFile: String,
    synopsis: String,
    uploadedAt: { type: Date, default: Date.now },
    changes: String
  }],
  adminFeedback: {
    type: String,
    default: ''
  },
  tags: [String],
  isbn: {
    type: String,
    unique: true,
    sparse: true
  },
  pageCount: {
    type: Number,
    default: 0
  },
  publicationDate: {
    type: Date
  },
  sales: {
    totalSold: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  reviews: [reviewSchema],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

bookSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

bookSchema.methods.updateRating = function() {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
};

export default mongoose.model('Book', bookSchema);