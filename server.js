const mongoose = require('mongoose');
const config = require('config');

process.on('uncaughtException', (error) => {
  console.log('UNCAUGHT REJECTION! SHUTTING DOWN...');
  console.log(error.name, error.message);
  process.exit(1);
});

const DB = config
  .get('database.host')
  .replace('<PASSWORD>', config.get('database.password'));

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Connected`);
  });

const app = require('./app');

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (error) => {
  console.log('UNHANDLER REJECTION! SHUTTING DOWN...');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1);
  });
});
