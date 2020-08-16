const router = require('express').Router();

const {
  addTeacher,
  updateTeacher,
  getTeacher
} = require('../controllers/Teacher');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getTeacher);

router
  .route('/addteacher')

  .post(protect, authorize('teacher'), addTeacher);

router
  .route('/updateteacher/:id')
  .put(protect, authorize('teacher'), updateTeacher);

// router
//   .route('/:id/photo')
//   .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// router
//   .route('/:id')
//   .get(getBootcamp)
//   .put(protect, authorize('publisher', 'admin'), updateBootcamp)
//   .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

// router.post('/login', login);
// router.get('/logout', logout);
// router.get('/me', protect, getMe);
// router.put('/updatedetails', protect, updateDetails);
// router.put('/updatepassword', protect, updatePassword);
// router.post('/forgotpassword', forgetPassword);
// router.get('/resetpassword/:resettoken', resetPassword);
// router.get('/verifyemail/:verifytoken/:email', verifyEmail);
module.exports = router;
