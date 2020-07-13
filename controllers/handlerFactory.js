const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/ApiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }

    return resp.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }

    return resp.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, resp, next) => {
    const doc = await Model.create(req.body);

    return resp.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, resp, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const doc = await query;

    if (!doc) {
      return next(new AppError('No doc found with that id', 404));
    }

    return resp.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, resp, next) => {
    // To allow for nested GET reviews on Tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const docs = await features.query;

    //SEND RESPONSE
    return resp.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });
