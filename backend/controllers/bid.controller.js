import mongoose from 'mongoose';
import Bid from '../models/Bid.model.js';
import Gig from '../models/Gig.model.js';

// Submit a bid
export const submitBid = async (req, res) => {
  try {
    const { gigId, message, proposedPrice, deliveryTime } = req.body;

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This gig is no longer accepting bids'
      });
    }

    // Can't bid on own gig
    if (gig.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own gig'
      });
    }

    // Check if already bid
    const existingBid = await Bid.findOne({ 
      gig: gigId, 
      freelancer: req.user._id 
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this gig'
      });
    }

    // Create bid
    const bid = await Bid.create({
      gig: gigId,
      freelancer: req.user._id,
      message,
      proposedPrice,
      deliveryTime
    });

    const populatedBid = await Bid.findById(bid._id)
      .populate('freelancer', 'name email avatar')
      .populate('gig', 'title budget');

    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully',
      bid: populatedBid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all bids for a gig (owner only)
export const getBidsForGig = async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    
    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Only gig owner can see bids
    if (gig.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bids for this gig'
      });
    }

    const bids = await Bid.find({ gig: gigId })
      .populate('freelancer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's bids
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// BONUS: Hire a freelancer (race condition safe)
export const hireBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    // Find bid and populate gig
    const bid = await Bid.findById(bidId).populate('gig');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const gig = bid.gig;

    // Verify gig owner
    if (gig.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to hire for this gig'
      });
    }

    // Check if gig is still open (prevents race condition with atomic update)
    const gigUpdate = await Gig.findOneAndUpdate(
      { 
        _id: gig._id, 
        status: 'open' // Only update if still open
      },
      { 
        status: 'assigned',
        hiredBid: bidId
      },
      { new: true }
    );

    // If gig wasn't updated, it means it's already assigned
    if (!gigUpdate) {
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned'
      });
    }

    // Update the hired bid status to 'hired'
    await Bid.findByIdAndUpdate(bidId, { status: 'hired' });

    // Update all other bids for this gig to 'rejected'
    await Bid.updateMany(
      { 
        gig: gig._id, 
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' }
    );

    // Fetch updated bid
    const updatedBid = await Bid.findById(bidId)
      .populate('freelancer', 'name email avatar')
      .populate('gig', 'title budget status');

    res.json({
      success: true,
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update bid (only if pending)
export const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { message, proposedPrice, deliveryTime } = req.body;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bid'
      });
    }

    // Can only update pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending bids'
      });
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      bidId,
      { message, proposedPrice, deliveryTime },
      { new: true, runValidators: true }
    ).populate('freelancer', 'name email avatar')
     .populate('gig', 'title budget');

    res.json({
      success: true,
      message: 'Bid updated successfully',
      bid: updatedBid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Withdraw bid
export const withdrawBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Check ownership
    if (bid.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this bid'
      });
    }

    // Can only withdraw pending bids
    if (bid.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending bids'
      });
    }

    await bid.deleteOne();

    res.json({
      success: true,
      message: 'Bid withdrawn successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
