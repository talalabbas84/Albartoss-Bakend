const mongoose = require('mongoose');

const googleCalendarSchema = new mongoose.Schema(
  {
    tokens: {
      access_token: {
        type: String
      },
      refresh_token: {
        type: String
      },
      scope: {
        type: String
      },
      token_type: String,
      expiry_date: Number
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

module.exports = mongoose.model('GoogleCalendar', googleCalendarSchema);
