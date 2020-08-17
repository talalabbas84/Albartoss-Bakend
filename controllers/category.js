const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Category = require(`../models/Category`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc Get all categories
// @route GET /api/v1/category
// @access Private
exports.getCategories = asynchandler(async (req, res, next) => {
  const categories = await Category.find({});

  if (!categories) {
    return next(new ErrorResponse(`No categories found`), 404);
  }
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});
