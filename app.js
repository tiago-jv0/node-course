const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(helmet());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app