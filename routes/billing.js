const router = require('express').Router();

const { getCategories } = require('../controllers/category');

const { protect, authorize } = require('../middleware/auth');

router.route('/').get(getCategories);

module.exports = router;
