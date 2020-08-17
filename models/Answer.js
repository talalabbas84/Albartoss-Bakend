const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    answer: {
      type: String,
      required
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Teacher'
    },
    question: {
      type: mongoose.Schema.ObjectId,
      ref: 'Question'
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Category', categorySchema);
