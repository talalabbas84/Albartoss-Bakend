const router = require('express').Router();

const {
  updateUser,
  studentPhotoUpload,
  getStudent
} = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getStudent);

router.route('/updateuser').put(protect, updateUser);

router.route('/photo').put(protect, studentPhotoUpload);

module.exports = router;
