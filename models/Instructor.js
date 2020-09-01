const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema(
  {
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    name: {
      type: String,
      required: true
    },
    dexterity: {
      type: [String]
    },
    timeZone: {
      type: String
    },
    language: {
      type: [String]
    },
    typeOfLessonsOffered: [String],
    description: {
      type: String
    },
    courseAffiliation: {
      type: String
    },
    rate: {
      type: Number
    },
    availableTimeSlots: {
      type: [String]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    review: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

module.exports = mongoose.model('Instructor', instructorSchema);
