function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
    },
  });
}

function errorHandler(error, _req, res, _next) {
  const statusCode = Number(error.statusCode || 500);
  const message =
    statusCode === 500 ? "Something went wrong. Please try again later." : error.message;

  res.status(statusCode).json({
    error: {
      details: error.details || null,
      message,
      statusCode,
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
