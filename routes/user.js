const router = require('express').Router();

const { updateUser, userPhotoUpload } = require('../controllers/user');

const { protect, authorize } = require('../middleware/auth');

router.route('/updateinfo').put(protect, updateUser);

router.route('/photo').put(protect, userPhotoUpload);

module.exports = router;
