const path = require('path');
ObjectId = require('mongodb').ObjectID;
const moment = require('moment');

const Lesson = require(`../models/Lesson`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const asyncHandler = require('../middleware/async');
const Instructor = require('../models/Instructor');
const GoogleCalendar = require('../models/GoogleCalendar');
const { google } = require('googleapis');

// @desc Book a Lesson
//@route POST /api/v1/lesson/booklesson
// @access Private Student
exports.bookLesson = asynchandler(async (req, res, next) => {
  req.body.lesson.lessonAssignedBy = req.user._id;

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
// @access Private (acccess to instructor)
exports.getScheduledLesson = asynchandler(async (req, res, next) => {
  console.log(req.user._id);
  let scheduledLesson;
  console.log(req.user);
  if (req.user.role === 'instructor') {
    scheduledLesson = await Lesson.find({
      lessonBookStatus: 'accept',
      lessonAssignedTo: req.user._id
    }).populate('lessonAssignedTo lessonAssignedBy');
  } else if (req.user.role === 'student') {
    scheduledLesson = await Lesson.find({
      lessonBookStatus: 'accept',
      lessonAssignedBy: req.user._id
    }).populate('lessonAssignedTo lessonAssignedBy');
  } else {
    return next(
      new ErrorResponse(`User ${req.user._id} is not authorized to add`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: scheduledLesson
  });
});

// @desc Showing teacher the lessons request
// @route GET /api/v1/lesson/getlessonrequest
//@access Private Teacher
exports.getLessonRequest = asynchandler(async (req, res, next) => {
  // Make sure user is course owner
  if (req.user.role !== 'instructor') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }

  const lessonsrequest = await Lesson.find({
    requested: true,
    lessonAssignedTo: req.user._id
  }).populate('lessonAssignedBy lessonAssignedTo');

  res.status(200).json({
    success: true,
    data: lessonsrequest
  });
});

// @desc Accept or decline the request
// @route POST /api/v1/lesson/lessonstatus/:id
//@access Private Teacher
exports.lessonStatus = asynchandler(async (req, res, next) => {
  // Make sure user is course owner
  if (req.user.role !== 'instructor') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  let lesson;

  if (req.body.lessonBookStatus === 'accept') {
    const googleCalendar = await GoogleCalendar.find({ user: req.user._id });

    lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      {
        lessonBookStatus: req.body.lessonBookStatus,
        requested: false
      },

      {
        new: true,
        runValidators: true
      }
    ).populate('lessonAssignedBy lessonAssignedTo');
    console.log(lesson);
    console.log(googleCalendar, 'goooooooooooogle calende');
    if (googleCalendar.length > 0) {
      console.log(lesson.lessonStarTime);
      console.log(lesson.lessonEndTime);

      const event = {
        summary: `Albartoss Lesson${lesson.lessonStarTime}-${lesson.lessonEndTime}`,

        description: `${lesson.description}`,
        start: {
          dateTime: '2015-05-28T09:00:00-07:00',
          timeZone: 'America/Los_Angeles'
        },
        end: {
          dateTime: '2015-05-28T09:00:00-07:00',
          timeZone: 'America/Los_Angeles'
        },
        recurrence: ['RRULE:FREQ=DAILY;COUNT=2'],
        // attendees: [
        //   { email: 'lpage@example.com' },
        //   { email: 'sbrin@example.com' }
        // ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 }
          ]
        }
      };
      const oauth2Client = new google.auth.OAuth2(
        process.env.googleClientID,
        process.env.googleClientSecret,
        process.env.googleRedirectedURL
      );
      oauth2Client.setCredentials(googleCalendar[0].tokens);
      const calendar = google.calendar({ version: 'v3', oauth2Client });
      await calendar.events.insert(
        {
          auth: oauth2Client,
          calendarId: 'primary',
          resource: event
        },
        function (err, event) {
          if (err) {
            console.log(err);
            console.log(err.data);
            console.log(
              'There was an error contacting the Calendar service: ' + err
            );
            return;
          }
          console.log(event, 'eventttttttttttttt');
          console.log('Event created: %s', event.htmlLink);
        }
      );
      console.log(googleCalendar);
    }
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
  const lessons = await Lesson.find({
    lessonAssignedBy: req.user._id
  }).populate('lessonAssignedBy lessonAssignedTo');

  let testlesssons = [];
  if (req.body.view === 'week') {
    testlesssons = lessons.map(lesson => {
      const date = moment(lesson.lessonDate).format('YYYY-M-D');
      console.log(date);

      const noOfweek = calcWeeksInMonth(moment(lesson.lessonDate));

      if (
        getWeekOfMonth(new Date(date)).toString() === req.body.weekNo.toString()
      ) {
        return lesson;
      }
    });
  } else if (req.body.view === 'day') {
    console.log(lessons);

    testlesssons = lessons.map(lesson => {
      const day = moment(lesson.lessonDate)
        .format('D/MM/YYYY')
        .toString()
        .split('/')[0];

      const month = moment(lesson.lessonDate)
        .format('D/MM/YYYY')
        .toString()
        .split('/')[1];

      console.log(day, 'day');
      console.log(month, 'month');
      console.log('hello');
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
