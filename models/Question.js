const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true
    },
    answer: {
      type: [mongoose.Schema.ObjectId],
      ref: 'Answer'
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Question', questionSchema);
