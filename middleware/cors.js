const cors = function (req, res, next) {
  res.header(
    "Access-Control-Allow-Origin",
    "https://ff-front-end.onrender.com"
  ); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

module.exports = cors;
