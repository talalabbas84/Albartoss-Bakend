const path = require('path');
ObjectId = require('mongodb').ObjectID;
const moment = require('moment');

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

// @desc Search the lessons by day view and week view
// @route GET /api/v1/lesson/getlessonsbyView
//@access Private Teacher
exports.getLessonsByView = asynchandler(async (req, res, next) => {
  const lessons = await Lesson.find({ lessonAssignedTo: req.user._id });

  let testlesssons = [];
  if (req.body.view === 'week') {
    testlesssons = lessons.map(lesson => {
      const date = moment(lesson.lessonDate).format('YYYY-M-D');
      console.log(getWeekOfMonth(new Date(date)));

      const noOfweek = calcWeeksInMonth(moment(lesson.lessonDate));

      if (
        getWeekOfMonth(new Date(date)).toString() === req.body.weekNo.toString()
      ) {
        return lesson;
      }
    });
  } else if (req.body.view === 'day') {
    testlesssons = lessons.map(lesson => {
      console.log(lesson.lessonDate);
      console.log(moment(lesson.lessonDate).format('D/M/YYYY'));

      const day = moment(lesson.lessonDate)
        .format('D/MM/YYYY')
        .toString()
        .split('/')[0];
      const month = moment(lesson.lessonDate)
        .format('D/MM/YYYY')
        .toString()
        .split('/')[1];
      if (
        day.toString() === req.body.dayNo &&
        month.toString() === req.body.monthNo
      ) {
        return lesson;
      }
    });
  }
  testlesssons = testlesssons.filter(test => test);

  res.status(200).json({
    success: true,
    data: testlesssons
  });
});

// @desc Get the lesson by lesson ID
// @route GET /api/v1/lesson/:id
//@access Private Teacher

exports.getLessonByID = asynchandler(async (req, res, next) => {
  const id = req.params.id;

  const lesson = await Lesson.findOne({ _id: id }).populate(
    'lessonAssignedTo lessonAssignedBy'
  );

  res.status(200).json({
    success: true,
    data: lesson
  });
});

const calcWeeksInMonth = momentDate => {
  const dateFirst = moment(momentDate).date(1);
  const dateLast = moment(momentDate).date(momentDate.daysInMonth());
  const startWeek = dateFirst.isoWeek();
  const endWeek = dateLast.isoWeek();

  if (endWeek < startWeek) {
    // cater to end of year (dec/jan)
    return dateFirst.weeksInYear() - startWeek + 1 + endWeek;
  } else {
    return endWeek - startWeek + 1;
  }
};

function getWeekOfMonth(date) {
  let adjustedDate = date.getDate() + date.getDay();
  let prefixes = ['0', '1', '2', '3', '4', '5'];
  return parseInt(prefixes[0 | (adjustedDate / 7)]) + 1;
}
