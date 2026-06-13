import express from "express";
import VerifyToken from "../middleware/auth.js";
import { getProfile, saveAddress, saveEducation, saveExperience, saveMemberDetails, savePersonal, saveUploadedDocs, uploadDocument, changePassword } from "../controllers/userController.js";
import logRequest from "../middleware/logRequestMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", logRequest("UserRoutes", "profile"), VerifyToken, getProfile);
router.put("/personal", logRequest("UserRoutes", "personal"), VerifyToken, savePersonal);
router.put("/address", logRequest("UserRoutes", "address"), VerifyToken, saveAddress);
router.put("/member-details", logRequest("UserRoutes", "member-details"), VerifyToken, saveMemberDetails);
router.put("/education", logRequest("UserRoutes", "education"), VerifyToken, saveEducation);
router.put("/experience", logRequest("UserRoutes", "experience"), VerifyToken, saveExperience);
router.put("/uploaded-docs", logRequest("UserRoutes", "uploaded-docs"), VerifyToken, saveUploadedDocs);
router.post("/upload-doc", logRequest("UserRoutes", "upload-doc"), VerifyToken, upload.single("file"), uploadDocument);
router.put("/change-password", logRequest("UserRoutes", "change-password", { redactedFields: ["current", "newPass", "confirm"] }), VerifyToken, changePassword);

export default router;
