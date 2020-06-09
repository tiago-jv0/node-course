const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('config');
const mongoSanitize = require('express-mongo-sanitize');

const hpp = require('hpp');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const globalErrorHandler = require('./controllers/error.controller');

const AppError = require('./utils/AppError');

const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/reviews.routes');

const app = express();

const enviroment = process.env.NODE_ENV || config.get('NODE_ENV');

// 1 ) GLOBAL MIDDLEWARES

//SET SECURITY HTTP HEADERS
app.use(helmet());

//DEVELOPMENT PLUGIN
if (enviroment === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUESTS FROM SAME API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour!',
});

app.use('/api', limiter);

//BODY PARSER, READING DATA FROM THE BODY INTO REQ.BODY
app.use(
  express.json({
    limit: '10kb',
  })
);

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

//PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage' 'maxGroupSize' , 'difficulty' , 'price'],
  })
);

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public/`));

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews' , reviewRouter)

app.all('*', (req, resp, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server !!!`, 400));
});

//GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
