const stripe = require('stripe')(process.env.stripeSecretKey);
const ErrorResponse = require(`../utils/errorResponse`);
const asynchandler = require(`../middleware/async`);
const _ = require('lodash');

// @desc Bill the customer
// @route POST /api/v1/billing
// @access Private
exports.billing = asynchandler(async (req, res, next) => {
  const charge = await stripe.charges.create({
    amount: req.body.amount,
    currency: req.body.currency,
    description: req.body.description,
    source: req.body.id
  });

  //Transfering to the bank account
  // const transfer = await stripe.transfers.create({
  //   amount: 400,
  //   currency: 'usd',
  //   destination: 'acct_1GXUOFCmmvAunLlX',
  //   transfer_group: 'ORDER_95'
  // });

  res.status(200).json({
    success: true,
    count: charge.length,
    data: charge
  });
});

// @desc Create the stripe account
// @route POST /api/v1/setup
// @access Private
exports.setupStripe = asynchandler(async (req, res, next) => {
  const account = await stripe.accounts.create({
    type: 'custom',
    country: req.body.countryCode,
    email: req.user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  });
  const { id } = account;
  stripe.accounts
    .update(id, {
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.connection.remoteAddress
      }
    })
    .then(() => {
      res.status(200).json({
        success: true,
        message: 'Account setup has begun',
        accountId: id
      });
    });
});

// @desc Get the Stripe Account
// @route GET /api/v1/stripe/account/get
// @access Private
exports.getStripeAccount = asynchandler(async (req, res, next) => {
  const stripeAccountId = req.body.stripeAccountId;
  if (!stripeAccountId) {
    return next(new ErrorResponse('Stripe Account doesnt exist', 401));
  } else {
    stripe.accounts.retrieve(stripeAccountId, (err, account) => {
      if (err) {
        return next(
          new ErrorResponse(
            'Something went wrong. An error occured while retreiving the account',
            401
          )
        );
      } else {
        res.status(200).json({
          success: true,
          message: 'Stripe Account',
          setupBegan: true
        });
      }
    });
  }
});

// @desc Save stripe Account
// @route GET /api/v1/stripe/account/save
// @access Private
exports.saveStripeAccount = asynchandler(async (req, res, next) => {
  const stripeAccountId = req.body.stripeAccountId;
  if (!stripeAccountId) {
    return next(new ErrorResponse('Stripe Account doesnt exist', 401));
  } else {
    let i = 0;
    let stripeObj = {};
    _.forEach(req.body, (value, key) => {
      const obj = nestObj(key, value);
      stripeObj = assign(stripeObj, obj);
      i += 1;
      if (i === Object.keys(req.body).length) {
        stripe.accounts.update(stripeAccountId, stripeObj).then(
          () => {
            res.status(200).json({
              success: true,
              message: 'Saved'
            });
          },
          err => {
            return next(new ErrorResponse(err, 401));
          }
        );
      }
    });
  }
});
// @desc Get the Stripe Account
// @route GET /api/v1/stripe/account/save
// @access Private
exports.getStripeAccount = asynchandler(async (req, res, next) => {
  const stripeAccountId = req.body.stripeAccountId;
  const stripeTokenId = req.body.stripeTokenId;
  if (!stripeAccountId) {
    return next(new ErrorResponse('Stripe Account doesnt exist', 401));
  } else if (!stripeTokenId) {
    return next(new ErrorResponse('Stripe Token doesnt exist', 401));
  } else {
    const stripeObj = {
      external_account: stripeTokenId
    };
    stripe.accounts.update(stripeAccountId, stripeObj).then(
      () => {
        res.status(200).json({
          success: true,
          message: 'Saved'
        });
      },
      err => {
        return next(new ErrorResponse(err, 401));
      }
    );
  }
});

function nestObj(keys, val) {
  var o = {},
    k = keys.split('.');
  return (
    k.reduce((r, e, i) => r[e] || (r[e] = k.length - 1 != i ? {} : val), o), o
  );
}
