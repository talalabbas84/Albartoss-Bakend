const router = require('express').Router();

const {
  addTeacher,
  updateTeacher,
  getTeacher,
  teacherPhotoUpload
} = require('../controllers/teacher');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getTeacher);

router
  .route('/addteacher')

  .post(protect, authorize('teacher'), addTeacher);

router
  .route('/updateteacher/:id')
  .put(protect, authorize('teacher'), updateTeacher);

router.route('/:id/photo').put(protect, teacherPhotoUpload);

// router
//   .route('/:id/photo')
//   .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

// router
//   .route('/:id')
//   .get(getBootcamp)
//   .put(protect, authorize('publisher', 'admin'), updateBootcamp)
//   .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
