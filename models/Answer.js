const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Answer', answerSchema);
