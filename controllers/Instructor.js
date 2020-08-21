const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Instructor = require(`../models/Instructor`);
const User = require(`../models/User`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);

// @desc GetInstructor
//@route GET /api/v1/instructor
//@route GET /api/v1/instructor/:bootcampId/courses
// @access Public
exports.getInstructors = asynchandler(async (req, res, next) => {
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

// @desc Get single instructor
// @route GET /api/v1/instructor/:id
// @access Pulic
exports.getInstructor = asynchandler(async (req, res, next) => {
  const instructor = await Instructor.findById(req.params.id).populate({
    path: 'user',
    select: 'name _id'
  });

  if (!instructor) {
    return next(
      new ErrorResponse(`No instructor witht the id of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: true,
    count: instructor.length,
    data: instructor
  });
});

// @desc Add Instructor
//@route POST /api/v1/instructor/addinstructor
// @access Private
exports.addInstructor = asynchandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Make sure user is course owner
  if (
    instructor.user.toString() !== req.user.id &&
    req.user.role !== 'instructor'
  ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to add`, 401)
    );
  }
  // const instructor = await Instructor.create(req.body);
  // res.status(200).json({
  //   success: true,
  //   data: instructor
  // });
});

//@desc Edit Instructor Profile
//@route PUT /api/v1/instructor/editprofile
// @access Private
exports.editProfile = asynchandler(async (req, res, next) => {
  console.log(req.user);
  console.log(req.userrole);
  if (req.user) {
    let account;

    account = await Instructor.find({
      _id: req.userrole
    });

    console.log(account, 'account');

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

    account = await Instructor.findByIdAndUpdate(
      account[0]._id,
      req.body.user,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user: account
    });
  } else {
    return next(new ErrorResponse(`Please Sign into the application.`), 404);
  }
});

// @desc Upload photo for instructor
//@route PUT /api/v1/instructor/:id/photo
// @access Private
exports.instructorPhotoUpload = asynchandler(async (req, res, next) => {
  const instructor = await Instructor.findById(req.userrole);
  if (!instructor) {
    return next(
      new ErrorResponse(`instructor not found with id of ${req.user._id}`, 404)
    );
  }

  if (
    instructor.user.toString() !== req.user.id &&
    req.user.role !== 'instructor'
  ) {
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

  //Create custom filename
  file.name = `photo_${instructor._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
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
