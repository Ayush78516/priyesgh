import express from "express";
import {
  createContact,
  getContacts,
  deleteContact,
  updateContactStatus,
  addContactNote,
  assignContact
} from "../controllers/contactController.js";
import VerifyToken from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { contactValidationRules, validate } from "../validators/contactValidator.js";
import logRequest from "../middleware/logRequestMiddleware.js";

const router = express.Router();

// Public submission
router.post("/", logRequest("ContactRoutes", "createContact"), contactValidationRules(), validate, createContact);

// Admin queries and search
router.get("/", logRequest("ContactRoutes", "getContacts"), VerifyToken, authorize(["admin", "super-admin"]), getContacts);

// CRM Workflows (Status, Notes, Assignment)
router.put("/:id/status", logRequest("ContactRoutes", "updateContactStatus"), VerifyToken, authorize(["admin", "super-admin"]), updateContactStatus);
router.post("/:id/notes", logRequest("ContactRoutes", "addContactNote"), VerifyToken, authorize(["admin", "super-admin"]), addContactNote);
router.put("/:id/assign", logRequest("ContactRoutes", "assignContact"), VerifyToken, authorize(["admin", "super-admin"]), assignContact);

// Restrictive deletion (Safety boundary check)
router.delete("/:id", logRequest("ContactRoutes", "deleteContact"), VerifyToken, authorize(["admin", "super-admin"]), deleteContact);

export default router;
