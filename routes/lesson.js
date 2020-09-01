const router = require('express').Router();

const {
  bookLesson,
  getLessonRequest,
  lessonStatus,
  getLessonsByView,
  getLessonByID,
  getScheduledLesson
} = require('../controllers/lesson');

const { protect, authorize } = require('../middleware/auth');

//router.route('/:id').get(getStudent);
router.route('/booklesson').post(protect, authorize('student'), bookLesson);
router.route('/getscheduledlesson').post(protect, getScheduledLesson);
router
  .route('/getlessonrequest')
  .get(protect, authorize('instructor'), getLessonRequest);

router
  .route('/lessonstatus/:id')
  .post(protect, authorize('instructor'), lessonStatus);

router.route('/getlessonsbyView').get(protect, getLessonsByView);
router.route('/:id').get(protect, getLessonByID);

module.exports = router;
