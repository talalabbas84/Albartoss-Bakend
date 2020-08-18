const router = require('express').Router();

const {
  updateStudent,
  studentPhotoUpload,
  getStudent
} = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getStudent);

router
  .route('/updatestudent')
  .put(protect, authorize('student'), updateStudent);

router.route('/photo').put(protect, studentPhotoUpload);

module.exports = router;
