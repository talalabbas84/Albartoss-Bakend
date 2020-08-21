const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Lesson = require(`../models/Lesson`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const asyncHandler = require('../middleware/async');
const Instructor = require('../models/Instructor');

// @desc Book a Lesson
//@route POST /api/v1/lesson/booklesson
// @access Private Student
exports.bookLesson = asynchandler(async (req, res, next) => {
  console.log(req.user, 'req userrr');
  req.body.lesson.lessonAssignedBy = req.user._id;
  console.log(req.userrole);

  // Make sure user is course owner
  if (req.user.role !== 'student') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  const lesson = await Lesson.create(req.body.lesson);
  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc Get all the currently scheduled lessons
//@route GET /api/v1/lesson/getscheduledlesson
// @access Private (acccess to both student and teacher)
exports.getScheduledLesson = asynchandler(async (req, res, next) => {
  console.log(req.user, 'req userrr');
  req.body.lesson.lessonAssignedBy = req.user._id;
  console.log(req.userrole);

  // Make sure user is course owner
  if (req.user.role !== 'student') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});

// @desc Showing teacher the lessons request
// @route GET /api/v1/lesson/getlessonrequest
//@access Private Teacher
exports.getLessonRequest = asynchandler(async (req, res, next) => {
  console.log(req.user, 'req userrr');
  //req.body.lesson.lessonAssignedBy = req.user._id;
  console.log(req.userrole);

  // Make sure user is course owner
  if (req.user.role !== 'instructor') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }

  const lessonsrequest = await Lesson.find({
    requested: true,
    lessonAssignedTo: req.user._id
  });

  res.status(200).json({
    success: true,
    data: lessonsrequest
  });
});

// @desc Accept or decline the request
// @route POST /api/v1/lesson/lessonstatus
//@access Private Teacher
exports.lessonStatus = asynchandler(async (req, res, next) => {
  console.log(req.user, 'req userrr');
  //req.body.lesson.lessonAssignedBy = req.user._id;
  console.log(req.userrole);

  // Make sure user is course owner
  if (req.user.role !== 'instructor') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  let lesson;

  if (req.body.lessonBookStatus === 'accept') {
    lesson = await Lesson.findByIdAndUpdate(
      {
        lessonBookStatus: req.body.lessonBookStatus,
        requested: false
      },

      {
        new: true,
        runValidators: true
      }
    );
  } else if (req.body.lessonBookStatus === 'decline') {
    lesson = await Lesson.findByIdAndUpdate(
      {
        lessonBookStatus: req.body.lessonBookStatus,
        requested: false,
        reasonForDecline: req.body.reasonForDecline
      },

      {
        new: true,
        runValidators: true
      }
    );
  }

  res.status(200).json({
    success: true,
    data: lesson
  });
});
