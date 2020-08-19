const router = require('express').Router();

const { getStudent } = require('../controllers/student');

const { protect, authorize } = require('../middleware/auth');

router.route('/:id').get(getStudent);

module.exports = router;
