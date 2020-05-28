const express = require('express');
const { updateMe, deleteMe } = require('../controllers/user.controller');

const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('resetPassword/:token', resetPassword);

router.patch('/updateMyPassword', protect, updatePassword);

router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

module.exports = router;
