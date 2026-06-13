import "dotenv/config";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import createLogger from "./utils/logger.js";

const logger = createLogger("app");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const seedSuperAdmin = async () => {
  await connectDB();

  const email = process.env.SUPER_ADMIN_EMAIL || "superadmin@covindia.com";
  const password = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

  try {
    logger.info("[seedSuperAdmin] Seeding started", { email });

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("[seedSuperAdmin] Super admin already exists, updating role", {
        email,
        userId: existing._id.toString()
      });
      existing.role = "super-admin";
      existing.designation = "Super Admin";
      await existing.save();
      logger.info("[seedSuperAdmin] Existing user updated to super-admin", {
        email,
        userId: existing._id.toString()
      });
    } else {
      const admin = await User.create({
        firstName: "Super",
        lastName: "Admin",
        email,
        phone: "0000000000",
        password,
        role: "super-admin",
        designation: "Super Admin",
        emailVerified: true
      });

      logger.info("[seedSuperAdmin] Super admin created successfully", {
        email,
        userId: admin._id.toString()
      });
    }
  } catch (error) {
    logger.error("[seedSuperAdmin] Failed", {
      email,
      error: error.message,
      stack: error.stack
    });
  } finally {
    await mongoose.connection.close();
  }
};

await seedSuperAdmin();
