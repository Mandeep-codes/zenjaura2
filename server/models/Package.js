import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Basic', 'Standard', 'Premium']
  },
  basePrice: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: [{
    name: String,
    included: Boolean
  }],
  addOns: {
    printedCopies: {
      name: { type: String, default: 'Printed Copies' },
      baseQuantity: { type: Number, default: 0 },
      maxQuantity: { type: Number, default: 1000 },
      pricePerUnit: { type: Number, default: 5 }
    },
    extraPages: {
      name: { type: String, default: 'Extra Pages' },
      basePagesIncluded: { type: Number, default: 100 },
      maxPages: { type: Number, default: 1000 },
      pricePerPage: { type: Number, default: 0.5 }
    }
  },
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Package', packageSchema);