// middleware/error-handler.js
import { STATUS_CODE } from "../Utils/app-error.js";

const ErrorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging

  const statusCode = err.statusCode || STATUS_CODE.INTERNAL_ERROR;
  const message = err.message || "Internal Server Error";

  // Send the error response
  res.status(statusCode).json({
    status: statusCode,
    message: message,
  });
};

export { ErrorHandler };
