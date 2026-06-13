import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  addAdmin,
  getAllAdmins,
  getAllUsers,
  getCMS,
  getStats,
  removeAdmin,
  updateAdminStatus,
  updateCMS,
  updateUserStatus,
  uploadCMSFile,
  uploadCMSFileToDrive,
  verifyPayment,
} from "../controllers/adminController.js";
import { getEmailLogs, getTermsLogs } from "../controllers/logController.js";
import VerifyToken from "../middleware/auth.js";
import logRequest from "../middleware/logRequestMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif|gif|pdf/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("Only images and PDFs are allowed"));
  },
});
const driveUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|avif|gif|pdf/i;
    if (allowed.test(path.extname(file.originalname))) cb(null, true);
    else cb(new Error("Only images and PDFs are allowed"));
  },
});

router.get("/users", logRequest("AdminRoutes", "users"), VerifyToken, authorize(["admin", "super-admin"]), getAllUsers);
router.put("/users/:id", logRequest("AdminRoutes", "update-user-status"), VerifyToken, authorize(["admin", "super-admin"]), updateUserStatus);
router.post("/verify-payment", logRequest("AdminRoutes", "verify-payment"), VerifyToken, authorize(["admin", "super-admin"]), verifyPayment);
router.get("/stats", logRequest("AdminRoutes", "stats"), VerifyToken, authorize(["admin", "super-admin"]), getStats);
router.get("/cms", logRequest("AdminRoutes", "cms"), VerifyToken, authorize(["admin", "super-admin"]), getCMS);
router.post("/cms", logRequest("AdminRoutes", "update-cms"), VerifyToken, authorize(["admin", "super-admin"]), updateCMS);
router.post("/cms/upload", logRequest("AdminRoutes", "upload-cms-file"), VerifyToken, authorize(["admin", "super-admin"]), upload.single("file"), uploadCMSFile);
router.post("/cms/upload-drive", logRequest("AdminRoutes", "upload-cms-file-drive"), VerifyToken, authorize(["admin", "super-admin"]), driveUpload.single("file"), uploadCMSFileToDrive);
router.post("/email_logs", logRequest("AdminRoutes", "email_logs"), VerifyToken, authorize(["admin", "super-admin"]), getEmailLogs);
router.post("/terms_logs", logRequest("AdminRoutes", "terms_logs"), VerifyToken, authorize(["admin", "super-admin"]), getTermsLogs);
router.get("/admins", logRequest("AdminRoutes", "admins"), VerifyToken, authorize(["admin", "super-admin"]), getAllAdmins);
router.post("/admins", logRequest("AdminRoutes", "add-admin"), VerifyToken, authorize(["admin", "super-admin"]), addAdmin);
router.put("/admins/:id/status", logRequest("AdminRoutes", "update-admin-status"), VerifyToken, authorize(["admin", "super-admin"]), updateAdminStatus);
router.delete("/admins/:id", logRequest("AdminRoutes", "remove-admin"), VerifyToken, authorize(["admin", "super-admin"]), removeAdmin);

export default router;
