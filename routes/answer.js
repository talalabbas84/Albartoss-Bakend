const router = require('express').Router();

const { answerQuestion } = require('../controllers/answer');

const { protect, authorize } = require('../middleware/auth');

//router.route('/').get(protect, getQuestions);
router
  .route('/answerquestion')
  .put(protect, authorize('instructor'), answerQuestion);

module.exports = router;
