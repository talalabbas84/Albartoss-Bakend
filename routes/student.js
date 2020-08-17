const router = require('express').Router();

const {
  updateStudent,
  studentPhotoUpload,
  getStudents
} = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getStudent);

router
  .route('/updatestudent/:id')
  .put(protect, authorize('student'), updateStudent);

router.route('/:id/photo').put(protect, studentPhotoUpload);

module.exports = router;
