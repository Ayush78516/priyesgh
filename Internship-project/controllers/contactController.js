import Contact from "../models/Contact.js";
import User from "../models/User.js";
import { sendThankYouEmail } from "../utils/mailer.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("contact");

// POST /api/contact - Create a new client inquiry
export const createContact = async (req, res, next) => {
  try {
    logger.info("[createContact] Request received", {
      requestId: req.requestId,
      email: req.body?.email || null
    });

    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required." });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || "",
      subject: subject || "",
      message,
      status: "New",
      notes: [],
      actionLogs: [{
        action: "Inquiry Submitted",
        details: "Client submitted message via contact form."
      }]
    });

    await contact.save();

    logger.info("[createContact] Contact message saved", {
      contactId: contact._id.toString()
    });

    // Send thank you email asynchronously
    sendThankYouEmail(name, email, subject, message, req.requestId)
      .then(sent => {
        logger.info("[createContact] Async thank you email check", { to: email, sent });
      })
      .catch(err => {
        logger.error("[createContact] Async thank you email failed", { to: email, error: err.message });
      });

    return res.status(200).json({
      success: true,
      message: "Message received successfully.",
      data: contact,
    });
  } catch (err) {
    logger.error("[createContact] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return next(err);
  }
};

// GET /api/contact - Query contacts with search, status filters, and sorting
export const getContacts = async (req, res, next) => {
  try {
    logger.info("[getContacts] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { status, search, sortBy } = req.query;
    const query = {};

    // 1. Status Filter
    if (status && status !== "All") {
      query.status = status;
    }

    // 2. Search Query (Matches case-insensitively across name, email, subject, phone, message)
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { subject: regex },
        { message: regex }
      ];
    }

    // 3. Sorting Resolution
    let sortObj = { createdAt: -1 }; // default newest first
    if (sortBy === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (sortBy === "followUp") {
      // Sort upcoming followUpDate first (null values placed at bottom)
      sortObj = { followUpDate: 1, createdAt: -1 };
    }

    const contacts = await Contact.find(query)
      .populate("assignedTo", "firstName lastName email")
      .sort(sortObj);

    logger.info("[getContacts] Completed successfully", {
      requestId: req.requestId,
      count: contacts.length
    });

    return res.json({ success: true, data: contacts });
  } catch (err) {
    logger.error("[getContacts] Failed", {
      requestId: req.requestId,
      error: err.message
    });
    return next(err);
  }
};

// PUT /api/contact/:id/status - Update lead status
export const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["New", "Follow Up", "Closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact inquiry not found." });
    }

    const performer = await User.findById(req.user.id);
    const performerName = performer ? `${performer.firstName} ${performer.lastName}` : "Admin";

    const oldStatus = contact.status;
    contact.status = status;
    contact.actionLogs.push({
      action: "Status Changed",
      performedBy: req.user.id,
      performedByName: performerName,
      details: `Status transitioned from '${oldStatus}' to '${status}'.`
    });

    await contact.save();

    logger.info("[updateContactStatus] Status updated", { id, oldStatus, newStatus: status });

    return res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: contact
    });
  } catch (err) {
    logger.error("[updateContactStatus] Failed", { id: req.params.id, error: err.message });
    return next(err);
  }
};

// POST /api/contact/:id/notes - Add follow-up note
export const addContactNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Note content cannot be empty." });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact inquiry not found." });
    }

    const performer = await User.findById(req.user.id);
    const performerName = performer ? `${performer.firstName} ${performer.lastName}` : "Admin";

    // Add note
    contact.notes.push({
      content: content.trim(),
      createdBy: req.user.id,
      createdByName: performerName,
      createdAt: new Date()
    });

    // Add action log
    contact.actionLogs.push({
      action: "Note Added",
      performedBy: req.user.id,
      performedByName: performerName,
      details: `Added a follow-up note.`
    });

    await contact.save();

    logger.info("[addContactNote] Note added to contact", { id });

    return res.json({
      success: true,
      message: "Note added successfully.",
      data: contact
    });
  } catch (err) {
    logger.error("[addContactNote] Failed", { id: req.params.id, error: err.message });
    return next(err);
  }
};

// PUT /api/contact/:id/assign - Assign inquiry/lead to admin and schedule follow-up
export const assignContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo, followUpDate } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Contact inquiry not found." });
    }

    const performer = await User.findById(req.user.id);
    const performerName = performer ? `${performer.firstName} ${performer.lastName}` : "Admin";

    let assigneeName = "Unassigned";
    if (assignedTo) {
      const assigneeUser = await User.findById(assignedTo);
      if (!assigneeUser) {
        return res.status(404).json({ success: false, message: "Assignee user not found." });
      }
      assigneeName = `${assigneeUser.firstName} ${assigneeUser.lastName}`;
      contact.assignedTo = assignedTo;
    } else {
      contact.assignedTo = null;
    }

    if (followUpDate !== undefined) {
      contact.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }

    // Log the assignment action
    const fUpString = contact.followUpDate ? ` Scheduled follow-up for ${contact.followUpDate.toLocaleDateString("en-IN")}.` : "";
    contact.actionLogs.push({
      action: "Assignment Updated",
      performedBy: req.user.id,
      performedByName: performerName,
      details: `Assigned inquiry to ${assigneeName}.${fUpString}`
    });

    await contact.save();

    logger.info("[assignContact] Contact assignment updated", { id, assignedTo });

    return res.json({
      success: true,
      message: "Assignment and follow-up details updated.",
      data: contact
    });
  } catch (err) {
    logger.error("[assignContact] Failed", { id: req.params.id, error: err.message });
    return next(err);
  }
};

// DELETE /api/contact/:id - Restrict message deletion (safety archive mechanism)
export const deleteContact = async (req, res, next) => {
  try {
    logger.info("[deleteContact] Request received (Attempting CRM Delete)", {
      contactId: req.params.id,
      userId: req.user?.id
    });

    // Enforce high authority for deletion
    if (req.user.role !== "super-admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Client contact messages cannot be deleted by standard administrators."
      });
    }

    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    return res.json({
      success: true,
      message: "Message deleted permanently by super-admin.",
      data: contact,
    });
  } catch (err) {
    return next(err);
  }
};
