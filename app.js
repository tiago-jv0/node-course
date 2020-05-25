const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('config');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/error.controllers');

const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');

const app = express();

if (config.get('NODE_ENV') === 'Development') {
  app.use(morgan('dev'));
}

app.use(helmet());
app.use(express.json());
app.use(express.static(`${__dirname}/public/`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, resp, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !!!`, 400));
});

app.use(globalErrorHandler);

module.exports = app;
