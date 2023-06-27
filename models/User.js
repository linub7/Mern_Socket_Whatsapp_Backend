const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please Tell Us Your name'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [16, 'Name must be less than 17 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid Email'],
    },
    picture: {
      type: Object,
      url: String,
      public_id: String,
    },
    status: {
      type: String,
      default: 'Hey there! I am using WhatsApp',
      minlength: [20, 'Status must be at least 20 characters.'],
      maxlength: [64, 'Status must be less than or equal to 64 characters.'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
      validate: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?])[A-Za-z\d#$@!%&*?]{8,30}$/,
        'Password must contain 1 uppercase, 1 lowercase, 1 special character, 1 number and between 8 and 30 characters.',
      ],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on SAVE and only when .create()!!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  }, // without toJSON: { virtuals: true }, toObject: { virtuals: true } our virtual field will now show
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

UserSchema.pre('save', async function (next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, salt);
  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // putting passwordChangedAt on second in the past will then ensure that the token is always created
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // we set select:false to password field -> so we can't use this.password and use its value
  // -> so we have to use an argument to represent storedPassword(userPassword)
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changePasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // JWTTimestamp in seconds, this.passwordChangedAt.getTime() in milliseconds -> divided by 1000
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp; // 100 < 200 -> true -> password changed
  }
  // false means that NOT changed
  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes(converted to milliseconds)
  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
