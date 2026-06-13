import createLogger from "../utils/logger.js";

const logger = createLogger("user");

export const authorize = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      logger.warn("[authorize] Access denied", {
        requestId: req.requestId || null,
        userId: req.user?.id || null,
        role: req.user?.role || null,
        requiredRoles: roles,
        url: req.originalUrl || req.url
      });

      return res.status(403).json({ success: false, message: "Forbidden: Access denied" });
    }
    return next();
  };
};
