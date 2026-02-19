class AppError extends Error {
    constructor(message, statusCode, type = "APPLICATION_ERROR", details = null) {
        super(message);
        this.statusCode = statusCode;
        this.type = type;
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
