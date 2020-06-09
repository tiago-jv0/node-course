const express = require('express');

const router = express.Router();

const { protect, restrictTo } = require('../controllers/auth.controller');
const {
  getAllReviews,
  createReview,
} = require('../controllers/review.controller');

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
