import { google } from "googleapis";
import { Readable } from "stream";
import createLogger from "./logger.js";

const logger = createLogger("google-drive");

const SCOPES = ["https://www.googleapis.com/auth/drive"];

let auth;

// Check if we should use OAuth2 (recommended for personal drives with quota issues)
if (process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
  auth = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID.trim(),
    process.env.GOOGLE_DRIVE_CLIENT_SECRET.trim()
  );
  const cleanToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.replace(/['"]+/g, '').trim();
  auth.setCredentials({ refresh_token: cleanToken });
  console.log("✅ GOOGLE DRIVE: Using OAuth2 (Personal Account)");
  console.log("Token check:", cleanToken?.substring(0, 15) + "...");
} else {
  // Fallback to Service Account
  auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });
  console.log("Using Service Account authentication");
}

const drive = google.drive({ version: "v3", auth });

/**
 * Creates a folder in Google Drive
 * @param {string} folderName 
 * @param {string} parentId 
 * @returns {Promise<string>} Folder ID
 */
export async function createFolder(folderName, parentId = process.env.GOOGLE_DRIVE_PARENT_ID) {
  try {
    // Check if folder already exists
    const response = await drive.files.list({
      q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and '${parentId}' in parents and trashed = false`,
      fields: "files(id)",
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const fileMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: "id",
    });

    return folder.data.id;
  } catch (err) {
    logger.error("[createFolder] Failed", { folderName, error: err.message });
    if (err.response?.data) {
      console.error("❌ GOOGLE API ERROR:", JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}

/**
 * Uploads a file to a specific folder in Google Drive
 * @param {Object} file - Multer file object
 * @param {string} driveFileName - Name to save as in Drive
 * @param {string} folderId - ID of the parent folder
 * @returns {Promise<Object>} Drive file metadata
 */
export async function uploadToDrive(file, driveFileName, folderId) {
  try {
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const fileMetadata = {
      name: driveFileName,
      parents: [folderId],
    };

    const media = {
      mimeType: file.mimetype,
      body: bufferStream,
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, webViewLink, webContentLink",
    });

    // Make file readable by anyone with the link (optional, based on requirement)
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return response.data;
  } catch (err) {
    logger.error("[uploadToDrive] Failed", { driveFileName, error: err.message });
    if (err.response?.data) {
      console.error("❌ GOOGLE API ERROR:", JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}

/**
 * Deletes a file from Google Drive
 * @param {string} fileId 
 */
export async function deleteFromDrive(fileId) {
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    logger.error("[deleteFromDrive] Failed", { fileId, error: err.message });
  }
}
