import CMS from "../models/CMS.js";
import User from "../models/User.js";
import createLogger from "../utils/logger.js";
import { createFolder, uploadToDrive } from "../utils/googleDrive.js";

const logger = createLogger("app");

export const getAllUsers = async (req, res) => {
  try {
    logger.info("[getAllUsers] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const users = await User.find({ role: "user" }).select("-password");

    logger.info("[getAllUsers] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      count: users.length
    });

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    logger.error("[getAllUsers] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { scrutinyStatus, isLocked } = req.body;

  try {
    logger.info("[updateUserStatus] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id
    });

    const updateFields = {};
    if (scrutinyStatus !== undefined) updateFields.scrutinyStatus = scrutinyStatus;
    if (isLocked !== undefined) updateFields.isLocked = isLocked;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      logger.warn("[updateUserStatus] User not found", {
        requestId: req.requestId,
        userId: req.user?.id || null,
        targetUserId: id
      });

      return res.status(404).json({ success: false, message: "User not found" });
    }

    logger.info("[updateUserStatus] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id
    });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    logger.error("[updateUserStatus] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  const { userId, orderId } = req.body;

  try {
    logger.info("[verifyPayment] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: userId,
      orderId
    });

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("[verifyPayment] User not found", {
        requestId: req.requestId,
        userId: req.user?.id || null,
        targetUserId: userId,
        orderId
      });

      return res.status(404).json({ success: false, message: "User not found" });
    }

    const payment = user.payments.find((item) => item.orderId === orderId);
    if (!payment) {
      logger.warn("[verifyPayment] Payment record not found", {
        requestId: req.requestId,
        userId: req.user?.id || null,
        targetUserId: userId,
        orderId
      });

      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    payment.status = "Completed";
    user.isLocked = true;
    await user.save();

    logger.info("[verifyPayment] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: userId,
      orderId
    });

    return res.status(200).json({ success: true, message: "Payment verified and form locked.", data: user });
  } catch (error) {
    logger.error("[verifyPayment] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: userId,
      orderId,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCMS = async (req, res) => {
  try {
    logger.info("[getCMS] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const cms = await CMS.find();

    logger.info("[getCMS] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      count: cms.length
    });

    return res.status(200).json({ success: true, data: cms });
  } catch (error) {
    logger.error("[getCMS] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCMS = async (req, res) => {
  const { key, value, type } = req.body;

  try {
    logger.info("[updateCMS] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      key
    });

    const item = await CMS.findOneAndUpdate(
      { key },
      { value, type, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    logger.info("[updateCMS] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      key
    });

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    logger.error("[updateCMS] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      key,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    logger.info("[getAllAdmins] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const admins = await User.find({ role: { $in: ["admin", "super-admin"] } }).select("-password");

    logger.info("[getAllAdmins] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      count: admins.length
    });

    return res.status(200).json({ success: true, data: admins });
  } catch (error) {
    logger.error("[getAllAdmins] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    logger.info("[updateAdminStatus] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id,
      isActive
    });

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }

    const admin = await User.findOneAndUpdate(
      { _id: id, role: { $in: ["admin", "super-admin"] } },
      { $set: { isActive } },
      { new: true }
    ).select("-password");

    if (!admin) {
      logger.warn("[updateAdminStatus] Admin not found", {
        requestId: req.requestId,
        userId: req.user?.id || null,
        targetUserId: id
      });

      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    logger.info("[updateAdminStatus] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id,
      isActive
    });

    return res.status(200).json({ success: true, data: admin });
  } catch (error) {
    logger.error("[updateAdminStatus] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addAdmin = async (req, res) => {
  const { firstName, lastName, email, phone, password, designation } = req.body;

  try {
    logger.info("[addAdmin] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      email
    });

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("[addAdmin] User already exists", {
        requestId: req.requestId,
        userId: req.user?.id || null,
        email
      });

      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const admin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "admin",
      designation: designation || "Admin"
    });

    logger.info("[addAdmin] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: admin._id.toString(),
      email
    });

    return res.status(201).json({
      success: true,
      message: "Admin added successfully",
      data: { firstName, lastName, email, role: "admin", designation: designation || "Admin" }
    });
  } catch (error) {
    logger.error("[addAdmin] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      email,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    logger.info("[removeAdmin] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id
    });

    const removed = await User.findOneAndDelete({ _id: id, role: { $in: ["admin", "super-admin"] } });
    if (!removed) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    logger.info("[removeAdmin] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id
    });

    return res.status(200).json({ success: true, message: "Admin removed" });
  } catch (error) {
    logger.error("[removeAdmin] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      targetUserId: id,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    logger.info("[getStats] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingScrutiny = await User.countDocuments({ scrutinyStatus: "Pending", role: "user" });
    const successfulPayments = await User.aggregate([
      { $unwind: "$payments" },
      { $match: { "payments.status": "Completed" } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$payments.amount" } } } }
    ]);

    logger.info("[getStats] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      totalUsers,
      pendingScrutiny
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRegistrations: totalUsers,
        pendingScrutiny,
        totalRevenue: successfulPayments[0]?.total || 0,
      }
    });
  } catch (error) {
    logger.error("[getStats] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadCMSFile = async (req, res) => {
  try {
    logger.info("[uploadCMSFile] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      fileName: req.file?.originalname || null
    });

    if (!req.file) {
      logger.warn("[uploadCMSFile] No file uploaded", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });

      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const url = `/uploads/${req.file.filename}`;

    logger.info("[uploadCMSFile] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      fileName: req.file.filename
    });

    return res.status(200).json({ success: true, url });
  } catch (error) {
    logger.error("[uploadCMSFile] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadCMSFileToDrive = async (req, res) => {
  try {
    logger.info("[uploadCMSFileToDrive] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      fileName: req.file?.originalname || null
    });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const folderId = await createFolder("COV-Admin-Uploads");
    const ext = req.file.originalname.split(".").pop();
    const safeBase = req.file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "event-upload";
    const driveFileName = `${Date.now()}-${safeBase}.${ext}`;
    const driveData = await uploadToDrive(req.file, driveFileName, folderId);

    logger.info("[uploadCMSFileToDrive] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      driveFileId: driveData.id
    });

    return res.status(200).json({
      success: true,
      url: `https://drive.google.com/uc?id=${driveData.id}`,
      webViewLink: driveData.webViewLink,
      webContentLink: driveData.webContentLink,
      fileId: driveData.id,
      storage: "google-drive"
    });
  } catch (error) {
    logger.error("[uploadCMSFileToDrive] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });
    return res.status(500).json({ success: false, message: error.message });
  }
};
