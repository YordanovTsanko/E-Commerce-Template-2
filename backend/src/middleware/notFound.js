import AppError from "../utils/AppError.js";

// След всички маршрути, преди errorHandler
const notFound = (req, res, next) => {
  next(new AppError(`Маршрутът не е намерен: ${req.method} ${req.originalUrl}`, 404));
};

export default notFound;
