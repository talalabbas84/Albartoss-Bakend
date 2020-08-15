const mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;

const lessonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Add a name']
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);
