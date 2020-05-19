const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
} = require('../controllers/tour.controllers');

const router = express.Router();

router.route('/').get(getAllTours).post([checkBody, createTour]);

router.param('id', checkID);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
