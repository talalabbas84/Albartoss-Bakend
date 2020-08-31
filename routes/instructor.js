const router = require('express').Router();

const {
  addInstructor,

  getInstructor,
  instructorPhotoUpload,
  editProfile
} = require('../controllers/Instructor');

const { protect, authorize } = require('../middleware/auth');
const { getLessonByID } = require('../controllers/lesson');

router.route('/:id').get(getInstructor);

// router
//   .route('/addinstructor')

//   .post(protect, authorize('instructor'), addInstructor);

router.route('/editprofile').put(protect, authorize('instructor'), editProfile);

router.route('/photo').put(protect, instructorPhotoUpload);

// router
//   .route('/:id/photo')
//   .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// router
//   .route('/:id')
//   .get(getBootcamp)
//   .put(protect, authorize('publisher', 'admin'), updateBootcamp)
//   .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
