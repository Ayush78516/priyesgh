import createLogger from "../utils/logger.js";

const logger = createLogger("app");

const errorHandler = (err, req, res, next) => {
  logger.error("[errorHandler] Unhandled error", {
    requestId: req.requestId || null,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.user?.id || null,
    error: err.message,
    stack: err.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
};

export default errorHandler;
