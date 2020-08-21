const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    timeZone: {
      type: String
    },
    language: {
      type: [String]
    },
    handicap: {
      type: String
    },
    areasOfFocusForStudents: {
      type: [String]
    },
    createdAt: {
      type: Date,
      default: Date.now
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

module.exports = mongoose.model('Student', studentSchema);
