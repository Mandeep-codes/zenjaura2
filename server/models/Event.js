import mongoose from 'mongoose';
import slugify from 'slugify';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String
  },
  maxAttendees: {
    type: Number,
    default: 0
  },
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Book Launch', 'Reading', 'Conference', 'Other'],
    default: 'Other'
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  tags: [String],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  remindersSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

eventSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

eventSchema.virtual('availableSpots').get(function() {
  if (this.maxAttendees === 0) return Infinity;
  return this.maxAttendees - this.registeredUsers.length;
});

export default mongoose.model('Event', eventSchema);