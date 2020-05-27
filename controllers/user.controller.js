const User = require('../models/user.model');
const ApiFeatures = require('../utils/ApiFeatures');
const catchAsync = require('../utils/catchAsync');

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
