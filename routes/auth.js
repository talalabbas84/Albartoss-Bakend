const router = require('express').Router();

const {
  register,
  login,
  getMe,
  forgetPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
  verifyEmail
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
// router.get('/logout', logout);
// router.get('/me', protect, getMe);
// router.put('/updatedetails', protect, updateDetails);
// router.put('/updatepassword', protect, updatePassword);
// router.post('/forgotpassword', forgetPassword);
// router.get('/resetpassword/:resettoken', resetPassword);
router.put('/verifyemail', protect, verifyEmail);
module.exports = router;
