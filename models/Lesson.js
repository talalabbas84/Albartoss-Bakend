const mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;

const lessonSchema = new mongoose.Schema({
  lessonStartTime: {
    type: Date,
    required: [true, 'Please enter the lesson start time']
  },
  lessonEndTime: {
    type: Date,
    required: [true, 'Please enter the lesson end time ']
  },
  lessonDate: {
    type: Date,
    required: [true, 'Please enter the lesson date']
  },
  lessonAssignedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lessonAssignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please enter the description of the lesson']
  },
  scheduled: {
    type: Boolean
  },
  lessonBookStatus: {
    type: String,
    enum: ['accept', 'decline']
  },
  reasonForDecline: {
    type: String
  },
  requested: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
