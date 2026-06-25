class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  if (err.name === 'CastError') {
    error = new AppError(`Resource not found with id: ${err.value}`, 404);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 400);
  }
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message).join('. ');
    error = new AppError(messages, 400);
  }
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please login again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Session expired. Please login again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = { errorHandler, AppError };