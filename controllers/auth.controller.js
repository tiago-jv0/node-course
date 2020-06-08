const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('config');

const { promisify } = require('util');

const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN'),
  });

const createSendToken = (user, statusCode, resp) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.get('JWT_COOKIE_EXPIRES_IN') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (config.get('NODE_ENV') === 'production') cookieOptions.secure = true;

  resp.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.password = undefined;

  return resp.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, resp);
});

exports.login = catchAsync(async (req, resp, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist

  if (!email || !password) {
    return next(new AppError('Please provide email and password', '400'));
  }

  //2) Check if the user exist && password is correct

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', '401'));
  }

  //3) IF everything ok , send token to client

  createSendToken(user, 200, resp);
});

exports.protect = catchAsync(async (req, resp, next) => {
  // 1) Getting token and check if it's there

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError(
        'You are not logged int! Please login in to get access',
        '401'
      )
    );

  // 2) Verification token

  const decoded = await promisify(jwt.verify)(token, config.get('JWT_SECRET'));

  // 3) Check if the user still exists

  const currentUser = await User.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError('The token belonging to the token no longer exist.', '401')
    );

  // 4) Check if user changed password after the token was issued;

  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError('User recently changed password! Please log in again', '401')
    );

  //Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, resp, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', '403')
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, resp, next) => {
  // 1 ) Get user based on Posted email

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError(' There is no user with email address', '404'));
  }

  // 2 ) Generate a random token

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3 ) Send it to user's email

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (Valid for 10 minutes)',
      message,
    });

    return resp.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try Again later',
        '500'
      )
    );
  }
});
exports.resetPassword = catchAsync(async (req, resp, next) => {
  // 1) Get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is an user, set the new password

  if (!user) {
    return next(new AppError('Token is invalid or has expired', '400'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.createPasswordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update the changedPasswordAt property for the user

  // 4) Log the user in, send JWT

  createSendToken(user, 200, resp);
});

exports.updatePassword = catchAsync(async (req, resp, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (!(await User.correctPassword(passwordCurrent, user.password)))
    return next(new AppError('Your current password is wrong', '401'));

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  createSendToken(user, 200, resp);
});
