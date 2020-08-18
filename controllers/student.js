const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Student = require(`../models/Student`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const User = require('../models/User');

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
// @access Pulic
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

// @desc Add Student
//@route POST /api/v1/student/addstudent
// @access Private
exports.addStudent = asynchandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Make sure user is course owner
  if (student.user.toString() !== req.user.id && req.user.role !== 'student') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  // const teacher = await Teacher.create(req.body);
  // res.status(200).json({
  //   success: true,
  //   data: teacher
  // });
});

// @desc Update Personal info Student
//@route PUT /api/v1/student/updatestudentprofile
// @access Private
exports.updateStudent = asynchandler(async (req, res, next) => {
  let student = await Student.find({ _id: req.userrole });

  if (!student || student.length <= 0) {
    return next(
      new ErrorResponse(`No student witht the id of ${req.userrole}`),
      404
    );
  }
  // Make sure user is course owner
  if (
    student[0].user.toString() !== req.user.id &&
    req.user.role !== 'student'
  ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update`, 401)
    );
  }

  student = await User.findByIdAndUpdate(req.user._id, req.body.user, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    user: student
  });
});

// @desc Upload photo for student
//@route PUT /api/v1/student/photo
// @access Private
exports.studentPhotoUpload = asynchandler(async (req, res, next) => {
  console.log(req.files.file);
  const student = await Student.findById(req.user._id);
  if (!student) {
    return next(
      new ErrorResponse(`student not found with id of ${req.user._id}`, 404)
    );
  }

  if (student.user.toString() !== req.user.id && req.user.role !== 'student') {
    return next(
      new ErrorResponse(
        `User ${req.user._id} is not authorized to update this`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image image file`, 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  console.log('checking out the file');
  console.log(file);

  //Create custom filename
  file.name = `photo_${student._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    const user = await User.findByIdAndUpdate(req.params.id, {
      photo: file.name
    });
    return res.status(200).json({ success: true, data: file.name, user });
  });
});

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
