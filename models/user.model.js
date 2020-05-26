const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'A user must have an email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide an valid email'],
  },

  photo: String,

  password: {
    type: String,
    required: [true, 'Provide a password'],
    minlength: 8,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: 8,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
