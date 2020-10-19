const Review = require(`../models/Review`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const Instructor = require(`../models/Instructor`);

// @desc Create a review
// @route GET /api/v1/review
// @access Private
exports.createReview = asynchandler(async (req, res, next) => {
  console.log(req.user, 'sasa');
  const { description, ratedTo } = req.body;
  const ratedBy = req.user._id;
  // Make sure user is course owner
  if (req.user.role !== 'student') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }

  const review = await Review.create({
    description,
    ratedBy,
    ratedTo
  });
  const teacheruser = await Instructor.findOne({ user: ratedTo });
  console.log(teacheruser);
  const teacher = await Instructor.findByIdAndUpdate(
    teacheruser.id,
    {
      $push: { review: review }
    },

    {
      new: true,
      runValidators: true
    }
  ).populate('user review');

  return res.status(200).json({
    success: true,
    data: review,
    teacher: teacher
  });
});
