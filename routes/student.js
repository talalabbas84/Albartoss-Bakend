const router = require('express').Router();

const { getStudent, editProfile } = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getStudent);
router.route('/editprofile').put(protect, editProfile);

module.exports = router;
