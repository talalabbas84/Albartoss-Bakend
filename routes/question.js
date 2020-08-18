const router = require('express').Router();

const { addQuestion, getQuestions } = require('../controllers/question');

const { protect, authorize } = require('../middleware/auth');

//router.route('/').get(protect, getQuestions);
router.route('/addquestion').post(protect, addQuestion);

module.exports = router;
