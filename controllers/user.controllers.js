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

exports.getAllUsers = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.createUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = (req, resp) => {
  resp.status(400).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
