const Tour = require('../models/tours.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getOverview = catchAsync(async (req, resp, next) => {
  //Get Data from database
  const tours = await Tour.find();

  return resp.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, resp, next) => {
  const { slug } = req.params;

  // const query = Tour.findOne({ slug }).populate({
  //   path: 'reviews',
  //   fields: 'review rating user',
  // });

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new AppError(`There's no tour with such a name`, '404'));
  }

  return resp.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, resp, next) => {
  return resp.status(200).render('login', {
    title: 'Log into your account',
  });
};
