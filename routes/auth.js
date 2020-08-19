const router = require('express').Router();

const {
  register,
  login,
  getMe,
  forgetPassword,
  resetPassword,
  verifyResetCode,
  updatePassword,
  logout,
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
module.exports = router;
