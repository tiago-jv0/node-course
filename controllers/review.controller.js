const catchAsync = require('../utils/catchAsync');
const Review = require('../models/review.model');

exports.getAllReviews = catchAsync(async (req, resp, next) => {
  const reviews = await Review.find();

  return resp.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, resp, next) => {
  const { review, rating, tour } = req.body;
  const newReview = await Review.create({
    review,
    rating,
    tour,
    user: req.user._id,
  });

  return resp.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});
