const router = require('express').Router();

const { getCategories } = require('../controllers/category');

const { protect } = require('../middleware/auth');
const {
  setupStripe,
  getStripeAccount,
  saveStripeAccount
} = require('../controllers/billing');

router.route('/').get(getCategories);
router.route('/setup').post(protect, setupStripe);
router.route('/account/get').get(protect, getStripeAccount);
router.route('/account/save', saveStripeAccount);
module.exports = router;
