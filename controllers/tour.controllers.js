const Tour = require('../models/tours.model');

exports.getAllTours = async (req, resp) => {
  try {
    //BUILD QUERY

    //1A - Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((field) => {
      delete queryObj[field];
    });
    //2B - Advanced filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    queryString = JSON.parse(queryString);

    let query = Tour.find(queryString);

    //2 - Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');

      query = query.sort(sortBy);

      //sort('price ratingsAverage')
    } else {
      query.sort('-createdAt');
    }

    //3 -Field Limiting

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
      //select('name price')
    } else {
      query.select('-__v');
    }

    // 4 - Pagination

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) {
        throw new Error('This page does not exist');
      }
    }

    //Execute query

    const tours = await query;

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
      message: 'Not found',
    });
  }
};

exports.getTour = async (req, resp) => {
  try {
    const { id } = req.params;

    const tour = await Tour.findById(id);
    return resp.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    return resp.status(404).json({
      status: 'fail',
      message: 'Not found',
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
