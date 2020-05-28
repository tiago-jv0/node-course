const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
} = require('../controllers/user.controller');

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

router.route('/').get(getAllUsers).post(createUser);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
