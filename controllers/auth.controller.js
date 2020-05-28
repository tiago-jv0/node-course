const jwt = require('jsonwebtoken');
const config = require('config');
const { promisify } = require('util');

const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, config.get('JWT_KEY'), {
    expiresIn: config.get('JWT_EXPIRES_IN'),
  });

exports.signUp = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  return resp.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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

  const token = signToken(user._id);

  return resp.status(200).json({
    status: 'success',
    token,
  });
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
