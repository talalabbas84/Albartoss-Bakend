const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, 'Please add your first name']
  },
  lastname: {
    type: String,
    required: [true, 'Please add your last name']
  },
  mobilenumber: {
    type: String,
    default: '',
    match: [
      /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g,
      'Please enter a correct phone number format'
    ]
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  streetNo: {
    type: String,
    default: ''
  },
  houseNo: {
    type: String,
    default: ''
  },
  city: { type: String, default: '' },
  postalCode: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  dateOfBirth: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    match: [
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/,
      'Please add a password containing 8-20 characters, 1 number, 1 uppercase letter,1 uppercase letter and one special character'
    ],
    select: false
  },
  verification: {
    type: Boolean,
    default: false
  },

  emailVerificationCode: String,
  emailVerificationExpire: String,
  resetPasswordCode: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

//Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function (userrole) {
  console.log('check the jwt token');
  console.log(userrole, 'checling if userole exist in jwt token');

  if (userrole.length > 0) {
    console.log(userrole[0]._id, 'user role');
    return jwt.sign(
      { id: this._id, user: userrole[0]._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE
      }
    );
  } else {
    console.log(userrole._id, 'user role');
    return jwt.sign(
      { id: this._id, user: userrole._id },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE
      }
    );
  }
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  // hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
