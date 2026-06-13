import jwt from "jsonwebtoken";
import User from "../models/User.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("user");

const VerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn("[VerifyToken] Authorization header missing", {
      requestId: req.requestId || null,
      url: req.originalUrl || req.url
    });

    return res.status(401).json({ success: false, message: "No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    logger.warn("[VerifyToken] Bearer token missing", {
      requestId: req.requestId || null,
      url: req.originalUrl || req.url
    });

    return res.status(401).json({ success: false, message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role isActive");

    if (!user || user.isActive === false) {
      logger.warn("[VerifyToken] Account inactive or missing", {
        requestId: req.requestId || null,
        url: req.originalUrl || req.url,
        userId: decoded.id
      });

      return res.status(403).json({ success: false, message: "Account is inactive or unavailable." });
    }

    req.user = { id: user._id.toString(), role: user.role };
    return next();
  } catch (err) {
    logger.warn("[VerifyToken] Invalid or expired token", {
      requestId: req.requestId || null,
      url: req.originalUrl || req.url,
      error: err.message
    });

    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

export default VerifyToken;
