// Utils/app-error.js
class AppError extends Error {
  constructor(
    name,
    statusCode,
    description,
    isOperational = true,
    errorStack = "",
    logingErrorResponse = false
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorStack = errorStack;
    this.logError = logingErrorResponse;
    Error.captureStackTrace(this);
  }
}

class APIError extends AppError {
  constructor(
    name,
    statusCode = 500,
    description = "Internal Server Error",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}

const STATUS_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export { AppError, APIError, STATUS_CODE };
