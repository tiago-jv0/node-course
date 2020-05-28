const User = require('../models/user.model');
const ApiFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFilters) => {
  const newObj = {};

  Object.keys(obj).forEach((field) => {
    if (allowedFilters.includes(field)) {
      newObj[field] = obj[field];
    }
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, resp) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const users = await features.query;

  resp.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, resp, next) => {
  // 1) Create an error if the user tries to update the password

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This route is not for passwordd updates. Please use /updateMyPassword',
        '400'
      )
    );

  // 2) Filtered out unwanted fields names that are not allowed to be updated

  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  resp.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
