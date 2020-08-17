const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    title: String,
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    address: {
      type: String
    },
    dateOfBirth: Date,
    mobilenumber: String,

    languages: {
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
