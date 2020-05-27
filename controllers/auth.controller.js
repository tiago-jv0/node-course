const jwt = require('jsonwebtoken');
const config = require('config');

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
