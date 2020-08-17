const router = require('express').Router();

const { getCategories } = require('../controllers/category');

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect, getCategories);

module.exports = router;
