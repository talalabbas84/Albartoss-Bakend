const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
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

    education: {
      type: String
    },
    languages: {
      type: [String]
    },
    chargePerHour: {
      type: Number
    },
    bio: {
      type: String
    },
    hoursLoggedIn: {
      type: Number
    },
    noOfQuestionsAnswered: Number,
    timeAvailibilty: {
      type: [String]
    },
    myExperience: {
      type: String
    },
    howIWouldTutorYou: {
      type: String
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

module.exports = mongoose.model('Teacher', teacherSchema);
