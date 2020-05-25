const Tour = require('../models/tours.model');
const APIFeatures = require('../utils/ApiFeatures');

exports.aliasTopTours = (req, resp, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, resp) => {
  try {
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
  } catch (error) {
    return resp.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getTour = async (req, resp) => {
  try {
    const tour = await Tour.findById(req.params.id);
    return resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    return resp.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.createTour = async (req, resp) => {
  try {
    const newTour = await Tour.create(req.body);

    return resp.status(201).json({
      status: 'success',
      data: {
        newTour,
      },
    });
  } catch (error) {
    return resp.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.updateTour = async (req, resp) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    return resp.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.deleteTour = async (req, resp) => {
  const { id } = req.params;

  try {
    await Tour.findByIdAndDelete(id);

    return resp.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    return resp.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.getTourStats = async (req, resp) => {
  try {
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
  } catch (error) {
    return resp.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, resp) => {
  try {
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
  } catch (error) {
    return resp.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};
