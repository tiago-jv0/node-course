const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const factory = require('./handlerFactory');

const catchAsync = require('../utils/catchAsync');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, '/public/img/users');
//   },
//   filename: (req, file, callback) => {
//     const [, extension] = file.mimetype.split('/');

//     callback(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image! Please upload only images', '400'),
      false
    );
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  return next();
};
const filterObj = (obj, ...allowedFilters) => {
  const newObj = {};

  Object.keys(obj).forEach((field) => {
    if (allowedFilters.includes(field)) {
      newObj[field] = obj[field];
    }
  });

  return newObj;
};

exports.getMe = (req, resp, next) => {
  req.params.id = req.user.id;

  next();
};

exports.deleteMe = catchAsync(async (req, resp, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  resp.status(204).json({
    status: 'success',
    data: null,
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
  if (req.file) filteredBody.photo = req.file.filename;

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

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.deleteUser = factory.deleteOne(User);

//Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
