import express from "express";
import {
  getCompanyProfiles, createCompanyProfile, updateCompanyProfile, deleteCompanyProfile,
  getGSTTaxes, createGSTTax, updateGSTTax, deleteGSTTax,
  getHSNSACs, createHSNSAC, updateHSNSAC, deleteHSNSAC,
  getInvoices, getInvoiceById, generateInvoiceForPayment, cancelInvoice, backfillInvoices, repairInvoiceNumbers
} from "../controllers/gstController.js";
import VerifyToken from "../middleware/auth.js";
import logRequest from "../middleware/logRequestMiddleware.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

// ── Company Profile Routes ──
router.get("/profile", logRequest("GSTRoutes", "getCompanyProfiles"), VerifyToken, getCompanyProfiles);
router.post("/profile", logRequest("GSTRoutes", "createCompanyProfile"), VerifyToken, authorize(["admin", "super-admin"]), createCompanyProfile);
router.put("/profile/:id", logRequest("GSTRoutes", "updateCompanyProfile"), VerifyToken, authorize(["admin", "super-admin"]), updateCompanyProfile);
router.delete("/profile/:id", logRequest("GSTRoutes", "deleteCompanyProfile"), VerifyToken, authorize(["admin", "super-admin"]), deleteCompanyProfile);

// ── Tax Master Routes ──
router.get("/tax", logRequest("GSTRoutes", "getGSTTaxes"), VerifyToken, getGSTTaxes);
router.post("/tax", logRequest("GSTRoutes", "createGSTTax"), VerifyToken, authorize(["admin", "super-admin"]), createGSTTax);
router.put("/tax/:id", logRequest("GSTRoutes", "updateGSTTax"), VerifyToken, authorize(["admin", "super-admin"]), updateGSTTax);
router.delete("/tax/:id", logRequest("GSTRoutes", "deleteGSTTax"), VerifyToken, authorize(["admin", "super-admin"]), deleteGSTTax);

// ── HSN/SAC Master Routes ──
router.get("/hsn", logRequest("GSTRoutes", "getHSNSACs"), VerifyToken, getHSNSACs);
router.post("/hsn", logRequest("GSTRoutes", "createHSNSAC"), VerifyToken, authorize(["admin", "super-admin"]), createHSNSAC);
router.put("/hsn/:id", logRequest("GSTRoutes", "updateHSNSAC"), VerifyToken, authorize(["admin", "super-admin"]), updateHSNSAC);
router.delete("/hsn/:id", logRequest("GSTRoutes", "deleteHSNSAC"), VerifyToken, authorize(["admin", "super-admin"]), deleteHSNSAC);

// ── Invoice Routes ──
router.get("/invoices", logRequest("GSTRoutes", "getInvoices"), VerifyToken, getInvoices);
router.get("/invoices/:id", logRequest("GSTRoutes", "getInvoiceById"), VerifyToken, getInvoiceById);
router.post("/invoices/generate", logRequest("GSTRoutes", "generateInvoiceForPayment"), VerifyToken, authorize(["admin", "super-admin"]), generateInvoiceForPayment);
router.put("/invoices/:id/cancel", logRequest("GSTRoutes", "cancelInvoice"), VerifyToken, authorize(["admin", "super-admin"]), cancelInvoice);
router.post("/invoices/backfill", logRequest("GSTRoutes", "backfillInvoices"), VerifyToken, authorize(["admin", "super-admin"]), backfillInvoices);
router.post("/invoices/repair-numbers", logRequest("GSTRoutes", "repairInvoiceNumbers"), VerifyToken, authorize(["admin", "super-admin"]), repairInvoiceNumbers);

export default router;
