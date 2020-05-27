const User = require('../models/user.model');

const catchAsync = require('../utils/catchAsync');

exports.signUp = catchAsync(async (req, resp, next) => {
  const newUser = await User.create({
    name: req.body.name,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    email: req.body.email,
    photo: req.body.photo,
  });

  return resp.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
