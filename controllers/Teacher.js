const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Teacher = require(`../models/Teacher`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc GetInstructor
//@route GET /api/v1/instructor
//@route GET /api/v1/instructor/:bootcampId/courses
// @access Public
exports.getTeachers = asynchandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc Get single teacher
// @route GET /api/v1/teacher/:id
// @access Pulic
exports.getTeacher = asynchandler(async (req, res, next) => {
  const teacher = await Teacher.findById(req.params.id).populate({
    path: 'user',
    select: 'name _id'
  });

  if (!teacher) {
    return next(
      new ErrorResponse(`No teacher witht the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    count: teacher.length,
    data: teacher
  });
});

// @desc Add Instructor
//@route POST /api/v1/teacher/addteacher
// @access Private
exports.addTeacher = asynchandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Make sure user is course owner
  if (teacher.user.toString() !== req.user.id && req.user.role !== 'teacher') {
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

// @desc Update Teacher
//@route PUT /api/v1/teacher/:id
// @access Private
exports.updateTeacher = asynchandler(async (req, res, next) => {
  let teacher = await Teacher.find({ _id: req.params.id });

  if (!teacher || teacher.length <= 0) {
    return next(
      new ErrorResponse(`No teacher witht the id of ${req.params.id}`),
      404
    );
  }
  // Make sure user is course owner
  if (
    teacher[0].user.toString() !== req.user.id &&
    req.user.role !== 'teacher'
  ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update`, 401)
    );
  }

  teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    success: true,
    data: teacher
  });
});

// @desc Upload photo for teacher
//@route PUT /api/v1/teacher/:id/photo
// @access Private
exports.teacherPhotoUpload = asynchandler(async (req, res, next) => {
  console.log(req.files.file);
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return next(
      new ErrorResponse(`Teacher not found with id of ${req.params.id}`, 404)
    );
  }

  if (teacher.user.toString() !== req.user.id && req.user.role !== 'teacher') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this`,
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
  file.name = `photo_${teacher._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Teacher.findByIdAndUpdate(req.params.id, { photo: file.name });
    return res.status(200).json({ success: true, data: file.name });
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
