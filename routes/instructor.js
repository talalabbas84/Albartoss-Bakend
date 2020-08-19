const router = require('express').Router();

const {
  addInstructor,
  updateInstructor,
  getInstructor,
  instructorPhotoUpload
} = require('../controllers/Instructor');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getInstructor);

router
  .route('/addinstructor')

  .post(protect, authorize('instructor'), addInstructor);

router
  .route('/updateinstructor')
  .put(protect, authorize('instructor'), updateInstructor);

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
