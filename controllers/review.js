const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Review = require(`../models/Review`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc Create a review
// @route GET /api/v1/review
// @access Private
exports.createReview = asynchandler(async (req, res, next) => {
  req.body.ratedBy = req.user._id;

  // Make sure user is course owner
  if (req.user.role !== 'student') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  const review = await Review.create(req.body);
  res.status(200).json({
    success: true,
    data: review
  });
});
