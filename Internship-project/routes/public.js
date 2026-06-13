import express from "express";
import { getPublicCms, getPublicGstTaxes } from "../controllers/publicController.js";
import logRequest from "../middleware/logRequestMiddleware.js";

const router = express.Router();

router.get("/cms", logRequest("PublicRoutes", "cms"), getPublicCms);
router.get("/gst/tax", logRequest("PublicRoutes", "gst-tax"), getPublicGstTaxes);

export default router;
