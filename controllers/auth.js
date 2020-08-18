const crypto = require('crypto');
var mongoose = require('mongoose');
const User = require(`../models/User`);
const Teacher = require(`../models/Teacher`);
const Student = require(`../models/Student`);
const ErrorResponse = require(`../utils/errorResponse`);
const sendEmail = require(`../utils/sendEmail`);
const asynchandler = require(`../middleware/async`);

//@desc Register user
//@route POST /api/v1/auth/register
// @access Public
exports.register = asynchandler(async (req, res, next) => {
  console.log('coming to register controller');
  console.log(req.body);
  const { email, password, role, mobilenumber, firstname, lastname } = req.body;

  const emailVerificationCode = Math.floor(1000 + Math.random() * 9000);

  //Create user
  const user = await User.create({
    firstname,
    lastname,
    email,
    password,
    role,
    mobilenumber,
    verification: false,
    emailVerificationCode: emailVerificationCode,
    emailVerificationExpire: Date.now() + 10 * 60 * 1000
  });

  let teacher;
  let student;

  if (role === 'teacher') {
    teacher = await Teacher.create({
      firstname,
      mobilenumber,
      lastname,
      user: user._id
    });
  } else if (role === 'student') {
    student = await Student.create({
      firstname,
      lastname,
      user: user._id
    });
  }
  console.log(user);
  const userrole = await getuserRoleId(user);

  //var val = Math.floor(1000 + Math.random() * 9000);

  if (user) {
    // Sending email to verify the email

    console.log(req.protocol);
    console.log(req.get('host'));
    // const VerificationUrl = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/auth/verifyemail/${user.emailVerificationCode}/${user.email} `;

    const message = `You are receiving this email because you
     (or someone else) has made an account with this email.
     Your verfication code is \n\n ${emailVerificationCode}
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification',
        message
      });
      user.password = '';
      sendTokenResponse(user, 200, res, userrole);
    } catch (err) {
      console.log(err);
      user.resetPasswordExpire = undefined;
      user.emailVerificationCode = undefined;
      await user.remove();

      return next(new ErrorResponse(`Email could not be sent`, 500));
    }
  }

  // sendTokenResponse(user, 200, res);
});

// @desc Verify Email
//@route PUT /api/v1/auth/verifyemail
// @access Public
exports.verifyEmail = asynchandler(async (req, res, next) => {
  // Get hashed token
  // const emailVerificationCode = crypto
  //   .createHash('sha256')
  //   .update(req.params.verifytoken)
  //   .digest('hex');

  //const userid = mongoose.Types.ObjectId(req.params.userid);

  // const user = await User.findOne({
  //   //emailVerificationCode: req.params.verifytoken.toString()
  //   _id: userid
  //   // emailVerificationExpire: { $gt: Date.now() }
  // });
  // email = req.params.email.trim();

  const user = await User.findOne({ email: req.user.email }).select(
    '-password'
  );
  console.log(user);
  const userrole = await getuserRoleId(user);

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }
  if (
    user.emailVerificationCode.toString() ===
      req.body.emailVerificationCode.toString() &&
    user.emailVerificationExpire > Date.now()
  ) {
    // Verify the  account
    user.verification = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpire = undefined;

    await user.save();
    sendTokenResponse(user, 200, res, userrole);
  } else {
    return next(new ErrorResponse('Invalid Verification Code', 400));
  }
});

// @desc Login user
//@route POST /api/v1/auth/login
// @access Public
exports.login = asynchandler(async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //Check for user
  const user = await User.findOne({ email }).select('+password');
  console.log(user, 'checking if user exist');
  const userrole = await getuserRoleId(user);

  if (!user) {
    return next(
      new ErrorResponse('Email Doesnt exist. Please click on join now', 401)
    );
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Email and Password dont match', 401));
  }

  user.password = '';
  console.log(userrole, 'checking if user role exist');

  sendTokenResponse(user, 200, res, userrole);
});

// @desc Log user out/ clear cookie
//@route GET /api/v1/auth/logout
// @access Private
// exports.logout = asynchandler(async (req, res) => {
//   res.cookie('token', 'none', {
//     expires: new Date(Date.now() + 10 * 1000),
//     httpOnly: true
//   });

//   res.status(200).json({
//     success: true,
//     data: {}
//   });
// });

// @desc Get current logged in user
//@route POST /api/v1/auth/me
// @access Private
exports.getMe = asynchandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc Update user details
//@route PUT /api/v1/auth/updatedetails
// @access Private
exports.updateDetails = asynchandler(async (req, res) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});
// @desc Update password
//@route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  //Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc Forgot password
//@route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgetPassword = asynchandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken} `;

  const message = `You are receiving this email because you
     (or someone else) has requested the reset of a password.
      Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });
    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// @desc Reset password
//@route PUT /api/v1/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = asynchandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, userrole) => {
  console.log(userrole, 'checking if user role exist in token');
  //Create token
  const token = user.getSignedJwtToken(userrole);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, user, userrole });
};

const getuserRoleId = async user => {
  console.log(user, 'roleees');
  let userrole;
  if (user.role === 'student') {
    userrole = await Student.find({ user: user._id });
  } else if (user.role === 'teacher') {
    userrole = await Teacher.find({ user: user._id });
  }

  return userrole;
};
