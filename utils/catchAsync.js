module.exports = (fn) => {
  return (req, resp, next) => {
    fn(req, resp, next).catch((error) => next(error));
  };
};
