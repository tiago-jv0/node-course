const express = require('express');

const router = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('../controllers/auth.controller');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourAndUserIds,
  getReview,
} = require('../controllers/review.controller');

router.use(protect);

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourAndUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
