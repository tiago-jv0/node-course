const mongoose = require('mongoose');
const config = require('config');

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
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
