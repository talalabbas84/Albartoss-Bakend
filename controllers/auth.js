const crypto = require('crypto');
var mongoose = require('mongoose');
const User = require(`../models/User`);
const Instructor = require(`../models/Instructor`);
const Student = require(`../models/Student`);
const ErrorResponse = require(`../utils/errorResponse`);
const sendEmail = require(`../utils/sendEmail`);
const asynchandler = require(`../middleware/async`);

//@desc Register user
//@route POST /api/v1/auth/register
// @access Public
exports.register = asynchandler(async (req, res, next) => {
  const { email, password, role, mobilenumber, name } = req.body;

  const emailVerificationCode = Math.floor(1000 + Math.random() * 9000);

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    mobilenumber,
    verification: false,
    emailVerificationCode: emailVerificationCode,
    emailVerificationExpire: Date.now() + 10 * 60 * 1000
  });

  let account;

  if (role === 'instructor') {
    account = await Instructor.create({
      name,
      mobilenumber,
      user: user._id
    });
  } else if (role === 'student') {
    account = await Student.create({
      name,
      mobilenumber,
      user: user._id
    });
  }

  const userrole = account;

  //var val = Math.floor(1000 + Math.random() * 9000);

  if (user) {
    // Sending email to verify the email

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
  const user = await User.findOne({ email: req.user.email }).select(
    '-password'
  );

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

// @desc Resend Email Verification
//@route PUT /api/v1/auth/resendverificationcode
// @access Private
exports.resendVerificationCode = asynchandler(async (req, res, next) => {
  const emailVerificationCode = Math.floor(1000 + Math.random() * 9000);
  const emailVerificationExpire = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      emailVerificationCode: emailVerificationCode,
      emailVerificationExpire: emailVerificationExpire
    },
    { new: true }
  );

  const userrole = await getuserRoleId(user);
  if (req.user) {
    // Sending email to verify the email

    // const VerificationUrl = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/auth/verifyemail/${user.emailVerificationCode}/${user.email} `;

    const message = `You are receiving this email because you
     (or someone else) has made an account with this email.
     Your verfication code is \n\n ${emailVerificationCode}
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Email Verification',
        message
      });
      user.password = '';
      sendTokenResponse(user, 200, res, userrole);
    } catch (err) {
      console.log(err);
      user.emailVerificationExpire = undefined;
      user.emailVerificationCode = undefined;
      await user.save();

      return next(new ErrorResponse(`Email could not be sent`, 500));
    }
  }
});

// @desc Resend Reset Verification code
//@route PUT /api/v1/auth/resendresetcode
// @access Private
exports.resendResetCode = asynchandler(async (req, res, next) => {
  const resetPasswordCode = Math.floor(1000 + Math.random() * 9000);
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      resetPasswordCode,
      resetPasswordExpire,
      resetPasswordVerification: false
    },
    { new: true }
  );

  //const userrole = await getuserRoleId(user);
  if (req.user) {
    // Sending email to verify the email

    // const VerificationUrl = `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/auth/verifyemail/${user.emailVerificationCode}/${user.email} `;

    const message = `You are receiving this email because you
    (or someone else) has requested the reset of a password.
     Here is your reset password verification code \n\n ${resetPasswordCode}
    `;

    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Reset Password Code',
        message
      });
      user.password = '';
      sendTokenResponse(user, 200, res, userrole);
    } catch (err) {
      console.log(err);
      user.resetPasswordExpire = undefined;
      user.resetPasswordCode = undefined;
      await user.remove();

      return next(new ErrorResponse(`Email could not be sent`, 500));
    }
  }
});

// @desc Login user
//@route POST /api/v1/auth/login
// @access Public
exports.login = asynchandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  //Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(
      new ErrorResponse('Email Doesnt exist. Please click on join now', 401)
    );
  }

  const userrole = await getuserRoleId(user);

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Email and Password dont match', 401));
  }

  user.password = '';

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

// @desc Update password
//@route PUT /api/v1/auth/updatepassword
// @access Private
exports.updatePassword = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  //Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  const userrole = await getuserRoleId(user);
  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, userrole);
});

// @desc Update password after Reset Code
//@route PUT /api/v1/auth/updatepasswordaftercode
// @access Private
exports.updatePasswordAfterCode = asynchandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  if (user.resetPasswordVerification) {
    const userrole = await getuserRoleId(user);
    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, userrole);
  } else {
    return next(new ErrorResponse('Reset Code is invalid', 401));
  }
});

// @desc Forgot password
//@route POST /api/v1/auth/forgotpassword
// @access Public
exports.forgetPassword = asynchandler(async (req, res, next) => {
  const account = await User.findOne({ email: req.body.email });

  if (!account) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }
  const resetPasswordCode = Math.floor(1000 + Math.random() * 9000);
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  const user = await User.findByIdAndUpdate(
    account._id,
    {
      resetPasswordCode,
      resetPasswordExpire,
      resetPasswordVerification: false
    },
    { new: true }
  );
  const userrole = await getuserRoleId(user);

  // Sending email to verify the email

  const message = `You are receiving this email because you
    (or someone else) has requested the reset of a password.
     Here is your reset password verification code \n\n ${resetPasswordCode}
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset Password Code',
      message
    });
    user.password = '';
    sendTokenResponse(user, 200, res, userrole);
  } catch (err) {
    console.log(err);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordVerification = false;
    await user.save();

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }
});

// @desc Verify Reset Code
//@route POST /api/v1/auth/verifyresetcode
// @access Public
exports.verifyResetCode = asynchandler(async (req, res, next) => {
  // Get hashed token
  if (req.user) {
    const user = await User.findOne({ email: req.user.email }).select(
      '-password'
    );

    const userrole = await getuserRoleId(user);

    if (!user) {
      return next(new ErrorResponse('User doesnt exist', 400));
    }

    if (
      user.resetPasswordCode &&
      user.resetPasswordCode &&
      user.resetPasswordCode.toString() ===
        req.body.resetPasswordCode.toString() &&
      user.resetPasswordExpire > Date.now()
    ) {
      // Verify the  account

      user.resetPasswordCode = undefined;
      user.resetPasswordExpire = undefined;
      user.resetPasswordVerification = true;

      await user.save();
      sendTokenResponse(user, 200, res, userrole);
    } else {
      return next(new ErrorResponse('Invalid Reset Verification Code', 400));
    }
  } else {
    return next(new ErrorResponse('User doesnt exist', 400));
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, userrole) => {
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
  let userrole;
  if (user.role === 'student') {
    userrole = await Student.find({ user: user._id });
  } else if (user.role === 'instructor') {
    userrole = await Instructor.find({ user: user._id });
  }

  return userrole;
};
