import User from "../models/User.js";
import createLogger from "../utils/logger.js";
import { createFolder, uploadToDrive } from "../utils/googleDrive.js";

const logger = createLogger("user");

export const getProfile = async (req, res) => {
  try {
    logger.info("[getProfile] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      logger.warn("[getProfile] User not found", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });

      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.tempMembershipId) {
      await user.save();
    }

    logger.info("[getProfile] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, data: user });
  } catch (err) {
    logger.error("[getProfile] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const savePersonal = async (req, res) => {
  try {
    logger.info("[savePersonal] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { firstName, lastName, email, personal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, email, personal },
      { new: true }
    ).select("-password");

    logger.info("[savePersonal] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Personal details saved", data: user });
  } catch (err) {
    logger.error("[savePersonal] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveAddress = async (req, res) => {
  try {
    logger.info("[saveAddress] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { permAddress, corrAddress, gstDetails } = req.body;
    const updateFields = { permAddress, corrAddress };
    if (gstDetails !== undefined) {
      updateFields.gstDetails = gstDetails;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select("-password");

    logger.info("[saveAddress] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Address saved", data: user });
  } catch (err) {
    logger.error("[saveAddress] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveMemberDetails = async (req, res) => {
  try {
    logger.info("[saveMemberDetails] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { memberDetails } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { memberDetails },
      { new: true }
    ).select("-password");

    logger.info("[saveMemberDetails] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Member details saved", data: user });
  } catch (err) {
    logger.error("[saveMemberDetails] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveEducation = async (req, res) => {
  try {
    logger.info("[saveEducation] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { education, professionalQualification } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { education, professionalQualification },
      { new: true }
    ).select("-password");

    logger.info("[saveEducation] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Education details saved", data: user });
  } catch (err) {
    logger.error("[saveEducation] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveExperience = async (req, res) => {
  try {
    logger.info("[saveExperience] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { experience } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { experience },
      { new: true }
    ).select("-password");

    logger.info("[saveExperience] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Experience details saved", data: user });
  } catch (err) {
    logger.error("[saveExperience] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const saveUploadedDocs = async (req, res) => {
  try {
    logger.info("[saveUploadedDocs] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    const { uploadedDocs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { uploadedDocs } },
      { new: true }
    ).select("-password");

    logger.info("[saveUploadedDocs] Completed successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Uploaded docs saved", data: user });
  } catch (err) {
    logger.error("[saveUploadedDocs] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};
export const uploadDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { docType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate folder name: FirstName-LastName-MembershipNo
    const firstName = (user.firstName || "User").replace(/\s+/g, "-");
    const lastName = (user.lastName || "").replace(/\s+/g, "-");
    const membershipNo = (user.tempMembershipId || "No-ID").replace(/\s+/g, "-");
    const folderName = `${firstName}-${lastName}-${membershipNo}`.replace(/-+$/, "");

    // 1. Ensure folder exists in Drive
    logger.info("[uploadDocument] Ensuring folder exists", { folderName });
    const folderId = await createFolder(folderName);

    // 2. Generate file name: FirstName-LastName-DocType
    const ext = file.originalname.split(".").pop();
    const driveFileName = `${firstName}-${lastName}-${docType}.${ext}`;

    // 3. Upload to Drive
    logger.info("[uploadDocument] Uploading to Drive", { driveFileName });
    const driveData = await uploadToDrive(file, driveFileName, folderId);

    // 4. Update User model
    const uploadedDocs = user.uploadedDocs || {};
    uploadedDocs[docType] = driveData.webViewLink; // Store the link
    // Also store the file ID for future reference
    if (!user.driveData) user.driveData = {};
    user.driveData[docType] = {
      fileId: driveData.id,
      link: driveData.webViewLink,
      folderId: folderId
    };

    user.markModified("uploadedDocs");
    user.markModified("driveData");
    await user.save();

    logger.info("[uploadDocument] Completed successfully", {
      userId,
      docType,
      driveFileId: driveData.id
    });

    return res.json({
      success: true,
      message: "Document uploaded to Google Drive",
      url: driveData.webViewLink,
      data: user
    });
  } catch (err) {
    logger.error("[uploadDocument] Failed", {
      userId: req.user?.id,
      error: err.message
    });
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { current, newPass, confirm } = req.body;
    
    logger.info("[changePassword] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    if (!current || !newPass || !confirm) {
      logger.warn("[changePassword] Missing required fields", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });
      return res.status(400).json({ success: false, message: "All password fields are required." });
    }
    if (newPass !== confirm) {
      logger.warn("[changePassword] Passwords do not match", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });
      return res.status(400).json({ success: false, message: "New password and confirmation do not match." });
    }
    if (newPass.length < 8) {
      logger.warn("[changePassword] Password too short", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn("[changePassword] User not found", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await user.matchPassword(current);
    if (!isMatch) {
      logger.warn("[changePassword] Incorrect current password", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    user.password = newPass;
    await user.save();

    logger.info("[changePassword] Password updated successfully", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    logger.error("[changePassword] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).json({ success: false, message: err.message });
  }
};
