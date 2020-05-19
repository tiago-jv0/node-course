const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, resp, next, value) => {
  const id = parseInt(value);

  if (id > tours.length) {
    return resp.status(404).json({
      status: 'fail',
      data: {
        message: 'Invalid ID',
      },
    });
  }

  next();
};

exports.checkBody = (req, resp, next) => {
  const { name, price } = req.body;

  return name && price
    ? next()
    : resp.status(400).json({
        status: 'fail',
        data: {
          message: 'Name and price is required',
        },
      });
};

exports.getAllTours = (req, resp) => {
  return resp.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, resp) => {
  const id = parseInt(req.params.id);

  const tour = tours.find((tour) => tour.id === id);

  return resp.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, resp) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = {
    ...req.body,
    id: newId,
  };

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      return resp.status(201).json({
        status: 'success',
        data: {
          newTour,
        },
      });
    }
  );
};

exports.updateTour = (req, resp) => {
  const id = parseInt(req.params.id);

  return resp.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here....>',
    },
  });
};

exports.deleteTour = (req, resp) => {
  const id = parseInt(req.params.id);

  return resp.status(204).json({
    status: 'success',
    data: null,
  });
};
