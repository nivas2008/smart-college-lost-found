const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['lost', 'found'], 
    required: true 
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String },
  color: { type: String },
  images: [{ type: String }],
  date: { type: Date, required: true }, // Date lost or found
  time: { type: String },
  location: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'claimed', 'returned', 'resolved'], 
    default: 'active' 
  },
  user: { // The person who reported it (Owner or Finder)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStorageLocation: { type: String }, // For found items
  contactNumber: { type: String }, // For lost items
  reward: { type: String } // For lost items
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
