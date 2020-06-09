const Tour = require('../models/tours.model');
const APIFeatures = require('../utils/ApiFeatures');
const AppError = require('../utils/AppError');

const catchAsync = require('../utils/catchAsync');

exports.aliasTopTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, resp, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();

  const tours = await features.query;

  //SEND RESPONSE
  return resp.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, resp, next) => {
  const tour = await (await Tour.findById(req.params.id)).populate({
    path: 'review',
  });
  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  return resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, resp, next) => {
  const newTour = await Tour.create(req.body);

  return resp.status(201).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.updateTour = catchAsync(async (req, resp, next) => {
  const { id } = req.params;

  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  return resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, resp, next) => {
  const { id } = req.params;

  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    return next(new AppError('No tour found with that id', 404));
  }

  return resp.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, resp, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  return resp.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, resp, next) => {
  const year = parseInt(req.params.year, 10);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' },
    },

    {
      $project: {
        _id: 0,
      },
    },

    {
      $sort: { numToursStarts: -1 },
    },

    {
      $limit: 12,
    },
  ]);

  return resp.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
