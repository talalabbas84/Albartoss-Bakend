const router = require('express').Router();
const passport = require('passport');
const { google } = require('googleapis');

const {
  register,
  login,
  updatePasswordAfterCode,
  forgetPassword,
  resetPassword,
  callbackURL,
  verifyResetCode,
  updatePassword,
  logout,
  googleAuth,
  verifyEmail,
  resendVerificationCode,
  resendResetCode
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
// router.get('/logout', logout);
// router.get('/me', protect, getMe);
// router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgetPassword);
router.post('/verifyresetcode', protect, verifyResetCode);
router.put('/verifyemail', protect, verifyEmail);
router.put('/resendverificationcode', protect, resendVerificationCode);
router.put('/resendresetcode', protect, resendResetCode);
router.put('/updatepasswordaftercode', protect, updatePasswordAfterCode);
router.get('/google', protect, googleAuth);

router.get('/google/callback', callbackURL);
module.exports = router;
