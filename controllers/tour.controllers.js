const Tour = require('../models/tours.model');

exports.getAllTours = async (req, resp) => {
  try {
    const tours = await Tour.find();
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
