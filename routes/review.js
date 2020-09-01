const router = require('express').Router();

const { addReview } = require('../controllers/review');

const { protect, authorize } = require('../middleware/auth');

router.route('/addreview').post(protect, authorize('student'), addReview);

module.exports = router;
