const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true // Why do you believe this is yours?
  },
  proof: {
    type: String // URL to uploaded proof (optional)
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminMessage: {
    type: String // Feedback from admin if rejected or approved
  }
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
