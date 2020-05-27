const config = require('config');
const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, '400');
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value : ${value}. Please use another value`;
  return new AppError(message, '400');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => error.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, '400');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', '401');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired!! Please log in again', '401');

const sendErrorDev = (err, resp) => {
  return resp.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProduction = (err, resp) => {
  if (err.isOperational) {
    return resp.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  return resp.status(500).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

module.exports = (err, req, resp, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const enviroment = process.env.NODE_ENV || config.get('NODE_ENV');

  if (enviroment === 'development') {
    sendErrorDev(err, resp);
  } else if (enviroment === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProduction(error, resp);
  }
};
