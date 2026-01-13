import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  gig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true
  },
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Proposal message is required'],
    trim: true,
    minlength: [20, 'Message must be at least 20 characters'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  proposedPrice: {
    type: Number,
    required: [true, 'Proposed price is required'],
    min: [1, 'Price must be at least $1']
  },
  status: {
    type: String,
    enum: ['pending', 'hired', 'rejected'],
    default: 'pending'
  },
  deliveryTime: {
    type: Number, // in days
    required: [true, 'Delivery time is required'],
    min: [1, 'Delivery time must be at least 1 day']
  }
}, {
  timestamps: true
});

// Prevent duplicate bids from same freelancer on same gig
bidSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

// Index for querying
bidSchema.index({ gig: 1, status: 1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
