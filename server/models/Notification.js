const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['claim_update', 'new_match', 'admin_message', 'system'],
    default: 'system'
  },
  link: {
    type: String // Optional link to redirect when clicked
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
