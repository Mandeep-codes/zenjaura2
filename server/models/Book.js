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
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
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
    required: true,
    maxlength: [2000, 'Synopsis cannot exceed 2000 characters']
  },
  genre: {
    type: String,
    required: true,
    enum: ['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Poetry', 'Children', 'Other']
  },
  coverImage: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Cover image must be a valid URL'
    }
  },
  manuscriptFile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Manuscript file must be a valid URL'
    }
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
    max: [9999.99, 'Price cannot exceed $9999.99']
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
    default: '',
    maxlength: [1000, 'Admin feedback cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'Invalid ISBN format'
    }
  },
  pageCount: {
    type: Number,
    default: 0,
    min: [0, 'Page count cannot be negative']
  },
  publicationDate: {
    type: Date
  },
  sales: {
    totalSold: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 }
  },
  reviews: [reviewSchema],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
bookSchema.index({ status: 1, isActive: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ 'rating.average': -1 });
bookSchema.index({ title: 'text', synopsis: 'text' });

bookSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { 
      lower: true, 
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
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