import express from "express";
import { getPaymentData, savePayment } from "../controllers/paymentController.js";
import VerifyToken from "../middleware/auth.js";
import logRequest from "../middleware/logRequestMiddleware.js";

const router = express.Router();

router.get("/initiate-data", logRequest("PaymentRoutes", "initiate-data"), VerifyToken, getPaymentData);
router.post("/save", logRequest("PaymentRoutes", "save"), savePayment);

export default router;
