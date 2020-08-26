const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Student = require(`../models/Student`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const User = require('../models/User');
const Instructor = require('../models/Instructor');

// @desc GetInstructor
//@route GET /api/v1/instructor
//@route GET /api/v1/instructor/:bootcampId/courses
// @access Public
// exports.getTeachers = asynchandler(async (req, res, next) => {
//   if (req.params.bootcampId) {
//     const courses = await Course.find({ bootcamp: req.params.bootcampId });

//     return res.status(200).json({
//       success: true,
//       count: courses.length,
//       data: courses
//     });
//   } else {
//     res.status(200).json(res.advancedResults);
//   }
// });

// @desc Get single student
// @route GET /api/v1/student/:id
// @access Private
exports.getStudent = asynchandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id).populate({
    path: 'user',
    select: 'name _id'
  });

  if (!student) {
    return next(
      new ErrorResponse(`No student witht the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    count: student.length,
    data: student
  });
});

//@desc Edit Student Profile
//@route PUT /api/v1/student/editprofile
// @access Private
exports.editProfile = asynchandler(async (req, res, next) => {
  if (req.user) {
    let account;

    account = await Student.find({ _id: req.userrole });

    if (!account || account.length <= 0) {
      return next(
        new ErrorResponse(`No User witht the id of ${req.userrole}`),
        404
      );
    }
    // Make sure user is course owner
    // if (
    //   student[0].user.toString() !== req.user.id &&
    //   req.user.role !== 'student'
    // ) {
    //   return next(
    //     new ErrorResponse(`User ${req.user.id} is not authorized to update`, 401)
    //   );
    // }

    account = await Student.findByIdAndUpdate(account[0]._id, req.body.user, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user: account
    });
  } else {
    return next(new ErrorResponse(`Please Sign into the application.`), 404);
  }
});

// // @desc Add Student
// //@route POST /api/v1/student/addstudent
// // @access Private
// exports.addStudent = asynchandler(async (req, res, next) => {
//   req.body.user = req.user.id;

//   // Make sure user is course owner
//   if (student.user.toString() !== req.user.id && req.user.role !== 'student') {
//     return next(
//       new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
//     );
//   }
//   // const teacher = await Teacher.create(req.body);
//   // res.status(200).json({
//   //   success: true,
//   //   data: teacher
//   // });
// });

// @desc Delete course
//@route Delete /api/v1/courses/:id
// @access Private
// exports.deleteCourse = asynchandler(async (req, res, next) => {
//   const course = await Course.findById(req.params.id);

//   if (!course) {
//     return next(
//       new ErrorResponse(`No course witht the id of ${req.params.bootcampId}`),
//       404
//     );
//   }
//   // Make sure user is course owner
//   if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(
//       new ErrorResponse(
//         `User ${req.user.id} is not authorized to delete course ${course._id}`,
//         401
//       )
//     );
//   }

//   await course.remove();
//   res.status(200).json({
//     success: true,
//     data: {}
//   });
// });
