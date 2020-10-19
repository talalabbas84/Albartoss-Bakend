const router = require('express').Router();

const { createReview } = require('../controllers/review');

const { protect, authorize } = require('../middleware/auth');

router.route('/addreview').post(protect, createReview);

module.exports = router;
