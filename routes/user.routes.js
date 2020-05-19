const express = require('express');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  checkID,
} = require('../controllers/user.controllers');

const router = express.Router();

router.route('/').get(getAllUsers).post(createUser);

router.param('id', checkID);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
