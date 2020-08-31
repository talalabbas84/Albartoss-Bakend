const mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;

const reviewSchema = new mongoose.Schema({
  description: {
    type: String
  },
  rating: {
    type: Number,
    enum: [1, 2, 3, 4, 5]
  },

  ratedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  ratedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
