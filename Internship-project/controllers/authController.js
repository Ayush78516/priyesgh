import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import redisClient from "../config/redis.js";
import User from "../models/User.js";
import createLogger from "../utils/logger.js";
import { recordEmailLog } from "../utils/activityLoggers.js";

const logger = createLogger("user");
const emailLogger = createLogger("email");

const emailHost = process.env.EMAIL_HOST?.trim();
const emailPort = Number(process.env.EMAIL_PORT || 587);
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS;
const emailSecure = process.env.EMAIL_SECURE
  ? process.env.EMAIL_SECURE === "true"
  : emailPort === 465;

const hasEmailConfig = Boolean(emailHost && emailPort && emailUser && emailPass);

const transporter = hasEmailConfig
  ? nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  : null;

function buildAuthResponse(user, refreshToken) {
  const isAdmin = user.role === "admin" || user.role === "super-admin";
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: isAdmin ? "365d" : "1h" }
  );

  return {
    token,
    refreshToken,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive !== false,
    tempMembershipId: user.tempMembershipId
  };
}

async function issueRefreshToken(userId) {
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await redisClient.setEx(`refresh:${userId}`, 7 * 24 * 3600, refreshToken);
  return refreshToken;
}

if (!hasEmailConfig) {
  emailLogger.warn("[transporter] Email transporter not configured", {
    hostConfigured: Boolean(emailHost),
    portConfigured: Boolean(emailPort),
    userConfigured: Boolean(emailUser),
    passConfigured: Boolean(emailPass)
  });
} else {
  transporter.verify((error) => {
    if (error) {
      emailLogger.error("[transporter] Email transporter verification failed", {
        error: error.message,
        stack: error.stack
      });
    } else {
      emailLogger.info("[transporter] Email transporter ready", {
        host: emailHost,
        port: emailPort
      }, { forceConsole: true });
    }
  });
}

export const sendOtp = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      logger.warn("[sendOtp] Email is required", {
        requestId: req.requestId,
        userId: req.user?.id || null
      });

      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    email = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    logger.info("[sendOtp] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      email
    });

    await redisClient.setEx(`otp:${email}`, 600, otp);

    if (!transporter) {
      emailLogger.error("[sendOtp] Email service is not configured", {
        requestId: req.requestId,
        email
      });
      recordEmailLog({
        source: "email",
        action: "send-otp",
        to: email,
        subject: "COV-Email Verification OTP",
        status: "FAILED",
        requestId: req.requestId,
        userId: req.user?.id || null,
        error: "Email service is not configured"
      });
      await redisClient.del(`otp:${email}`);
      return res.status(500).json({
        success: false,
        message: "Email service is not configured"
      });
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || emailUser,
        to: email,
        subject: "COV-Email Verification OTP",
        html: `<h2>Your OTP:<strong>${otp}</strong></h2><p>This OTP is valid for 10 minutes.</p>`
      });

      emailLogger.info("[sendOtp] OTP email sent", {
        requestId: req.requestId,
        email
      });
      recordEmailLog({
        source: "email",
        action: "send-otp",
        to: email,
        subject: "COV-Email Verification OTP",
        status: "SENT",
        requestId: req.requestId,
        userId: req.user?.id || null
      });
    } catch (err) {
      emailLogger.error("[sendOtp] Failed to send OTP email", {
        requestId: req.requestId,
        email,
        error: err.message,
        stack: err.stack
      });
      recordEmailLog({
        source: "email",
        action: "send-otp",
        to: email,
        subject: "COV-Email Verification OTP",
        status: "FAILED",
        requestId: req.requestId,
        userId: req.user?.id || null,
        error: err.message
      });
      await redisClient.del(`otp:${email}`);
      return res.status(502).json({
        success: false,
        message: "Failed to send OTP email"
      });
    }

    logger.info("[sendOtp] Completed successfully", {
      requestId: req.requestId,
      email
    });

    return res.json({
      success: true,
      message: "OTP sent to email"
    });
  } catch (err) {
    logger.error("[sendOtp] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase().trim();

    logger.info("[verifyOtp] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      email
    });

    const stored = await redisClient.get(`otp:${email}`);

    if (!stored || stored !== otp) {
      logger.warn("[verifyOtp] Invalid or expired OTP", {
        requestId: req.requestId,
        email
      });

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    await redisClient.del(`otp:${email}`);
    await redisClient.setEx(`verified:${email}`, 3600, "true");

    logger.info("[verifyOtp] Completed successfully", {
      requestId: req.requestId,
      email
    });

    return res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (err) {
    logger.error("[verifyOtp] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    let { firstName, lastName, email, phone, password } = req.body;
    email = email.toLowerCase().trim();

    logger.info("[register] Request received", {
      requestId: req.requestId,
      email
    });

    const isVerified = await redisClient.get(`verified:${email}`);
    if (!isVerified) {
      logger.warn("[register] Email not verified", {
        requestId: req.requestId,
        email
      });

      return res.status(400).json({ success: false, message: "Please verify your email" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("[register] Email already registered", {
        requestId: req.requestId,
        email
      });

      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = new User({ firstName, lastName, email, phone, password, emailVerified: true });
    await user.save();

    await redisClient.del(`verified:${email}`);
    const refreshToken = await issueRefreshToken(user._id);

    logger.info("[register] Completed successfully", {
      requestId: req.requestId,
      userId: user._id.toString(),
      email,
      phone
    });

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
      ...buildAuthResponse(user, refreshToken)
    });
  } catch (err) {
    logger.error("[register] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    logger.info("[login] Request received", {
      requestId: req.requestId,
      email
    });

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("[login] Invalid email or password", {
        requestId: req.requestId,
        email
      });

      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.role === "admin" || user.role === "super-admin") {
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive"
        });
      }
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.warn("[login] Invalid email or password", {
        requestId: req.requestId,
        userId: user._id.toString(),
        email
      });

      return res.status(400).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const refreshToken = await issueRefreshToken(user._id);

    logger.info("[login] Completed successfully", {
      requestId: req.requestId,
      userId: user._id.toString(),
      email,
      role: user.role
    });

    return res.json({
      success: true,
      message: "Login successful",
      ...buildAuthResponse(user, refreshToken)
    });
  } catch (err) {
    logger.error("[login] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email?.toLowerCase().trim();

    logger.info("[loginWithOtp] Request received", {
      requestId: req.requestId,
      email
    });

    if (!email || !otp) {
      logger.warn("[loginWithOtp] Email and OTP are required", {
        requestId: req.requestId,
        email: email || null
      });

      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp || storedOtp !== otp) {
      logger.warn("[loginWithOtp] Invalid or expired OTP", {
        requestId: req.requestId,
        email
      });

      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("[loginWithOtp] User not found", {
        requestId: req.requestId,
        email
      });

      return res.status(404).json({
        success: false,
        message: "Account not found"
      });
    }

    if (user.role === "admin" || user.role === "super-admin") {
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message: "Admin account is inactive"
        });
      }
    }

    await redisClient.del(`otp:${email}`);
    const refreshToken = await issueRefreshToken(user._id);

    logger.info("[loginWithOtp] Completed successfully", {
      requestId: req.requestId,
      userId: user._id.toString(),
      email,
      role: user.role
    });

    return res.json({
      success: true,
      message: "Login successful",
      ...buildAuthResponse(user, refreshToken)
    });
  } catch (err) {
    logger.error("[loginWithOtp] Failed", {
      requestId: req.requestId,
      email: req.body?.email || null,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const { token } = req.body;

    logger.info("[refreshTokenController] Request received", {
      requestId: req.requestId
    });

    if (!token) {
      logger.warn("[refreshTokenController] No refresh token provided", {
        requestId: req.requestId
      });

      return res.status(403).json({
        success: false,
        message: "No refresh token"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const stored = await redisClient.get(`refresh:${decoded.id}`);

    if (!stored || stored !== token) {
      logger.warn("[refreshTokenController] Invalid refresh token", {
        requestId: req.requestId,
        userId: decoded?.id || null
      });

      return res.status(403).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or unavailable"
      });
    }
    const isAdmin = user?.role === "admin" || user?.role === "super-admin";

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: user?.role },
      process.env.JWT_SECRET,
      { expiresIn: isAdmin ? "365d" : "1h" }
    );

    logger.info("[refreshTokenController] Completed successfully", {
      requestId: req.requestId,
      userId: decoded.id
    });

    return res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    logger.error("[refreshTokenController] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.body;

    logger.info("[logout] Request received", {
      requestId: req.requestId
    });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    await redisClient.del(`refresh:${decoded.id}`);

    logger.info("[logout] Completed successfully", {
      requestId: req.requestId,
      userId: decoded.id
    });

    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    logger.error("[logout] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });

    return res.status(500).json({ success: false, message: err.message });
  }
};

//forgot-password
export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      logger.warn("[forgotPassword] Email is required", {
        requestId: req.requestId
      });
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    email = email.toLowerCase().trim();

    logger.info("[forgotPassword] Request received", {
      requestId: req.requestId,
      email
    });

    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await redisClient.setEx(`reset:${email}`, 1800, token);

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      if (!transporter) {
        emailLogger.error("[forgotPassword] Email service is not configured", {
          requestId: req.requestId,
          email
        });
        recordEmailLog({
          source: "email",
          action: "forgot-password",
          to: email,
          subject: "COV – Password Reset Request",
          status: "FAILED",
          requestId: req.requestId,
          userId: user._id.toString(),
          error: "Email service is not configured"
        });
        await redisClient.del(`reset:${email}`);
        return res.status(500).json({
          success: false,
          message: "Email service is not configured"
        });
      }

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || emailUser,
          to: email,
          subject: "COV – Password Reset Request",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;border-radius:12px;border:1px solid #e2e8f0;">
              <h2 style="color:#002b5b;margin-bottom:8px;">Password Reset</h2>
              <p style="color:#475569;">We received a request to reset the password for your COV account.</p>
              <p style="color:#475569;">Click the button below to set a new password. This link is valid for <strong>30 minutes</strong>.</p>
              <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#002b5b,#00a6a6);color:#fff;border-radius:8px;text-decoration:none;font-weight:700;">Reset Password</a>
              <p style="color:#94a3b8;font-size:13px;">If you did not request this, you can safely ignore this email.</p>
            </div>
          `,
        });

        emailLogger.info("[forgotPassword] Reset email sent", {
          requestId: req.requestId,
          email
        });
        recordEmailLog({
          source: "email",
          action: "forgot-password",
          to: email,
          subject: "COV – Password Reset Request",
          status: "SENT",
          requestId: req.requestId,
          userId: user._id.toString()
        });
      } catch (mailErr) {
        emailLogger.error("[forgotPassword] Failed to send reset email", {
          requestId: req.requestId,
          email,
          error: mailErr.message,
          stack: mailErr.stack
        });
        recordEmailLog({
          source: "email",
          action: "forgot-password",
          to: email,
          subject: "COV – Password Reset Request",
          status: "FAILED",
          requestId: req.requestId,
          userId: user._id.toString(),
          error: mailErr.message
        });
        await redisClient.del(`reset:${email}`);
        return res.status(502).json({ success: false, message: "Failed to send reset email. Please try again later." });
      }
    } else {
      logger.warn("[forgotPassword] Email not registered", {
        requestId: req.requestId,
        email
      });
    }

    return res.json({ success: true, message: "If that email is registered, a password reset link has been sent." });
  } catch (err) {
    logger.error("[forgotPassword] Unexpected error", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).json({ success: false, message: err.message });
  }
};

//reset-password
export const resetPassword = async (req, res) => {
  try {
    let { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
      logger.warn("[resetPassword] Missing required fields", {
        requestId: req.requestId,
        hasEmail: Boolean(email),
        hasToken: Boolean(token),
        hasPassword: Boolean(newPassword)
      });
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (newPassword.length < 8) {
      logger.warn("[resetPassword] Password too short", {
        requestId: req.requestId,
        email
      });
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    email = email.toLowerCase().trim();
    logger.info("[resetPassword] Request received", {
      requestId: req.requestId,
      email
    });

    const stored = await redisClient.get(`reset:${email}`);
    if (!stored || stored !== token) {
      logger.warn("[resetPassword] Invalid or expired token", {
        requestId: req.requestId,
        email
      });
      return res.status(400).json({ success: false, message: "Invalid or expired reset link. Please request a new one." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("[resetPassword] User not found", {
        requestId: req.requestId,
        email
      });
      return res.status(400).json({ success: false, message: "User not found." });
    }

    user.password = newPassword;
    await user.save();
    await redisClient.del(`reset:${email}`);

    logger.info("[resetPassword] Completed successfully", {
      requestId: req.requestId,
      userId: user._id.toString(),
      email
    });

    return res.json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (err) {
    logger.error("[resetPassword] Unexpected error", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).json({ success: false, message: err.message });
  }
};
