const express = require('express');

const router = express.Router();

const {
  getOverview,
  getTour,
  getLoginForm,
} = require('../controllers/views.controller');

router.get('/', getOverview);
router.get('/tour/:slug', getTour);

router.get('/login', getLoginForm);

module.exports = router;
