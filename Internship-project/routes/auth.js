import express from "express";
import { sendOtp, verifyOtp, register, login, loginWithOtp, refreshTokenController, logout, forgotPassword, resetPassword } from "../controllers/authController.js";
import logRequest from "../middleware/logRequestMiddleware.js";

const router = express.Router();

router.post("/send-otp", logRequest("AuthRoutes", "send-otp"), sendOtp);
router.post("/verify-otp", logRequest("AuthRoutes", "verify-otp", { redactedFields: ["otp"] }), verifyOtp);
router.post("/register", logRequest("AuthRoutes", "register"), register);
router.post("/login", logRequest("AuthRoutes", "login"), login);
router.post("/login-otp", logRequest("AuthRoutes", "login-otp", { redactedFields: ["otp"] }), loginWithOtp);
router.post("/refresh", logRequest("AuthRoutes", "refresh"), refreshTokenController);
router.post("/logout", logRequest("AuthRoutes", "logout"), logout);
router.post("/forgot-password", logRequest("AuthRoutes", "forgot-password"), forgotPassword);
router.post("/reset-password", logRequest("AuthRoutes", "reset-password", { redactedFields: ["token", "newPassword"] }), resetPassword);

export default router;
