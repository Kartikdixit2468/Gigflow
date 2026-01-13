import Gig from '../models/Gig.model.js';
import Bid from '../models/Bid.model.js';

// Get all gigs with search and filter
export const getAllGigs = async (req, res) => {
  try {
    const { search, status = 'open', page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const gigs = await Gig.find(query)
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gig.countDocuments(query);

    res.json({
      success: true,
      gigs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single gig
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('owner', 'name email avatar');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.json({
      success: true,
      gig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create gig
export const createGig = async (req, res) => {
  try {
    const { title, description, budget, category, skills } = req.body;

    const gig = await Gig.create({
      title,
      description,
      budget,
      category,
      skills,
      owner: req.user._id
    });

    const populatedGig = await Gig.findById(gig._id)
      .populate('owner', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig: populatedGig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update gig
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check ownership
    if (gig.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this gig'
      });
    }

    // Can't update if already assigned
    if (gig.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update assigned gig'
      });
    }

    const { title, description, budget, category, skills } = req.body;

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { title, description, budget, category, skills },
      { new: true, runValidators: true }
    ).populate('owner', 'name email avatar');

    res.json({
      success: true,
      message: 'Gig updated successfully',
      gig: updatedGig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete gig
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check ownership
    if (gig.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this gig'
      });
    }

    // Delete all bids associated with this gig
    await Bid.deleteMany({ gig: req.params.id });

    await gig.deleteOne();

    res.json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's posted gigs
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ owner: req.user._id })
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      gigs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
