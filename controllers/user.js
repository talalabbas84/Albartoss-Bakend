const path = require('path');
ObjectId = require('mongodb').ObjectID;

const Student = require(`../models/Student`);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const User = require('../models/User');
const Instructor = require('../models/Instructor');

// @desc Upload photo for student
//@route PUT /api/v1/user/photo
// @access Private
exports.userPhotoUpload = asynchandler(async (req, res, next) => {
  let account;
  if (req.user.role === 'student') {
    account = await Student.find({ _id: req.userrole });
  } else if (req.user.role === 'instructor') {
    account = await Instructor.find({ _id: req.userrole });
  }

  if (!account || !account[0].user) {
    return next(
      new ErrorResponse(`student not found with id of ${req.user._id}`, 404)
    );
  }

  if (account[0].user.toString() !== req.user.id) {
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
  file.name = `photo_${account[0]._id}${path.parse(file.name).ext}`;
  // cloudinary.config({
  //   cloud_name: `${process.env.CLOUDINARY_NAME}`,
  //   api_key: `${process.env.CLOUDINARY_API_KEY}`,
  //   api_secret: `${process.env.CLOUDINARY_API_SECRET}`
  // });

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
      photo: `https://albatross-v1.herokuapp.com/uploads/${file.name}`
    });
    console.log(user);
    return res.status(200).json({
      success: true,
      data: file.name,
      user,
      url: `https://albatross-v1.herokuapp.com/uploads/${file.name}`
    });
  });
  // cloudinary.v2.uploader.upload(
  //   path.join(__dirname, `public/uploads/${file.name}`),
  //   {
  //     resource_type: 'image',
  //     public_id: 'my_folder/my_sub_folder/my_dog',
  //     overwrite: true,
  //     notification_url: 'https://mysite.example.com/notify_endpoint'
  //   },
  //   function (error, result) {
  //     console.log(result, error);
  //   }
  // );
});

// @desc Update accountal info User
//@route PUT /api/v1/user/updateinfo
// @access Private
exports.updateUser = asynchandler(async (req, res, next) => {
  if (req.user) {
    let account;
    if (req.user.role === 'student') {
      account = await Student.find({ _id: req.userrole });
    } else if (req.user.role === 'instructor') {
      account = await Instructor.find({ _id: req.userrole });
    }

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

    account = await User.findByIdAndUpdate(req.user._id, req.body.user, {
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
