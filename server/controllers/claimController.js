const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// @desc    Create a claim for an item
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item, description } = req.body;
    
    // check if claim already exists
    const existingClaim = await Claim.findOne({ item, user: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item' });
    }

    let proof = null;
    if (req.files && req.files.length > 0) {
      proof = `/uploads/${req.files[0].filename}`;
    }

    const claim = new Claim({
      item,
      user: req.user._id,
      description,
      proof
    });

    const createdClaim = await claim.save();
    
    res.status(201).json(createdClaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private
const getClaims = async (req, res) => {
  try {
    let query = {};
    // If not admin, only get user's claims
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const claims = await Claim.find(query)
      .populate('user', 'name email department collegeId')
      .populate('item')
      .sort({ createdAt: -1 });
      
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update claim status (Approve/Reject)
// @route   PUT /api/claims/:id
// @access  Private/Admin
const updateClaimStatus = async (req, res) => {
  try {
    const { status, adminMessage } = req.body;
    
    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.adminMessage = adminMessage;
    const updatedClaim = await claim.save();

    // If approved, update item status to claimed
    if (status === 'approved') {
      const item = await Item.findById(claim.item._id);
      item.status = 'claimed';
      await item.save();
    }

    // Create Notification for user
    await Notification.create({
      user: claim.user,
      message: `Your claim for ${claim.item.name} has been ${status}. ${adminMessage || ''}`,
      type: 'claim_update'
    });

    res.json(updatedClaim);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createClaim, getClaims, updateClaimStatus };
