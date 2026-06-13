import express from "express";
import {
  getConsoleLogs,
  getRequestLogs
} from "../controllers/logController.js";
import VerifyToken from "../middleware/auth.js";
import logRequest from "../middleware/logRequestMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.post(
  "/all_api_logs",
  logRequest("LogRoutes", "all_api_logs"),
  VerifyToken,
  authorize(["admin", "super-admin"]),
  getRequestLogs
);

router.post(
  "/all_console_logs",
  logRequest("LogRoutes", "all_console_logs"),
  VerifyToken,
  authorize(["admin", "super-admin"]),
  getConsoleLogs
);

export default router;
