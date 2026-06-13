import "./config/env.js";
import cors from "cors";
import express from "express";
import fs from "fs";
import crypto from "crypto";
import mongoose from "mongoose";
import path from "path";
import qs from "querystring";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import redisClient from "./config/redis.js";
import { decrypt, encrypt } from "./ccavutil.js";
import errorHandler from "./middleware/error.js";
import logRequest from "./middleware/logRequestMiddleware.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contacts.js";
import logsRoutes from "./routes/logs.js";
import paymentRoutes from "./routes/payment.js";
import publicRoutes from "./routes/public.js";
import userRoutes from "./routes/user.js";
import gstRoutes from "./routes/gst.js";
import createLogger from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appLogger = createLogger("app");
const paymentLogger = createLogger("payment");

const app = express();
const PORT = process.env.PORT || 3000;

const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
let BASE_URL = process.env.BASE_URL || "http://localhost:3000";
if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = "http://" + BASE_URL;
}

const CCAV_URL = process.env.CCAVENUE_ENV === "production"
  ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

function buildCorsConfig(baseUrl) {
  const normalizeHost = (value) => (value || "").toLowerCase().replace(/^www\./, "");
  const allowedOrigins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);
  const normalizedAllowedHosts = new Set(
    Array.from(allowedHosts).map((host) => normalizeHost(host))
  );

  try {
    const parsedBaseUrl = new URL(baseUrl);
    allowedHosts.add(parsedBaseUrl.hostname);
    normalizedAllowedHosts.add(normalizeHost(parsedBaseUrl.hostname));
    allowedOrigins.add(parsedBaseUrl.origin);
    allowedOrigins.add(`http://${parsedBaseUrl.hostname}`);
    allowedOrigins.add(`https://${parsedBaseUrl.hostname}`);

    if (parsedBaseUrl.port) {
      allowedOrigins.add(`http://${parsedBaseUrl.hostname}:${parsedBaseUrl.port}`);
      allowedOrigins.add(`https://${parsedBaseUrl.hostname}:${parsedBaseUrl.port}`);
    }
  } catch (error) {
    appLogger.warn("[cors] Failed to parse BASE_URL", {
      baseUrl,
      error: error.message
    });
  }

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      try {
        const parsedOrigin = new URL(origin);
        if (
          allowedHosts.has(parsedOrigin.hostname) ||
          normalizedAllowedHosts.has(normalizeHost(parsedOrigin.hostname))
        ) {
          callback(null, true);
          return;
        }
      } catch (error) {
        appLogger.warn("[cors] Failed to parse request origin", {
          origin,
          error: error.message
        });
      }

      // Don't hard-fail the request (breaks static assets); just omit CORS headers.
      callback(null, false);
    },
    credentials: true
  };
}

await connectDB();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  appLogger.info("[server] Created uploads directory", { uploadsDir });
}

app.use(cors(buildCorsConfig(BASE_URL)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.use("/api", logsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gst", gstRoutes);
app.use("/api/public", publicRoutes);

app.post("/ccavRequestHandler", logRequest("CCAvenue", "ccavRequestHandler"), (req, res) => {
  try {
    paymentLogger.info("[ccavRequestHandler] Request received", {
      requestId: req.requestId,
      hasWorkingKey: !!WORKING_KEY,
      workingKeyLen: WORKING_KEY?.length || 0,
      hasAccessCode: !!ACCESS_CODE,
      accessCodeLen: ACCESS_CODE?.length || 0,
      merchantId: req.body?.merchant_id || "none",
      ccavUrl: CCAV_URL
    });

    const body = qs.stringify(req.body);
    const encRequest = encrypt(body, WORKING_KEY);
    const formBody = `
      <html><body>
      <center><p>Please wait... redirecting to payment gateway.</p></center>
      <form id="nonseamless" method="post" name="redirect" action="${CCAV_URL}">
        <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" id="access_code" value="${ACCESS_CODE}">
        <script language="javascript">document.redirect.submit();</script>
      </form>
      </body></html>
    `;
    res.setHeader("Content-Type", "text/html");
    paymentLogger.info("[ccavRequestHandler] Redirect form generated", {
      requestId: req.requestId
    });
    return res.send(formBody);
  } catch (err) {
    paymentLogger.error("[ccavRequestHandler] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).send("Payment initiation failed: " + err.message);
  }
});

app.post("/ccavResponseHandler", logRequest("CCAvenue", "ccavResponseHandler"), (req, res) => {
  try {
    paymentLogger.info("[ccavResponseHandler] Request received", {
      requestId: req.requestId
    });

    const encResp = req.body.encResp;
    if (!encResp) {
      paymentLogger.warn("[ccavResponseHandler] Missing encrypted response", {
        requestId: req.requestId
      });
      return res.redirect(`${BASE_URL}/payment-status?status=failed`);
    }

    const ccavResponse = decrypt(encResp, WORKING_KEY);
    const params = {};
    ccavResponse.split("&").forEach((pair) => {
      const [key, ...value] = pair.split("=");
      if (key) params[key.trim()] = value.join("=").trim();
    });

    const status = params.order_status;
    const orderId = params.order_id;
    const amount = params.amount;
    const trackingId = params.tracking_id;
    const bankRefNo = params.bank_ref_no;
    const failureMsg = params.failure_message;
    const membershipNo = params.merchant_param2;
    const memberType = params.merchant_param3;
    const memberClass = params.merchant_param4;
    const validTill = params.merchant_param5;
    const gstTaxId = params.merchant_param6;
    const paymentMode = params.payment_mode;

    if (status === "Success") {
      const signature = crypto.createHmac("sha256", WORKING_KEY)
        .update((orderId || "") + (amount || "") + (params.merchant_param1 || ""))
        .digest("hex");

      fetch(`http://localhost:${PORT}/api/payment/save`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-payment-signature": signature
        },
        body: JSON.stringify({
          orderId,
          trackingId,
          bankRefNo,
          amount,
          memberType,
          memberClass,
          membershipNo,
          validTill,
          gstTaxId,
          paymentMode,
          status: "Success",
          paidAt: new Date().toISOString(),
          merchantParam1: params.merchant_param1,
        }),
      }).catch((err) => {
        paymentLogger.error("[ccavResponseHandler] Failed to persist payment callback", {
          requestId: req.requestId,
          orderId,
          error: err.message
        });
      });

      const receiptData = encodeURIComponent(JSON.stringify({
        orderId,
        trackingId,
        bankRefNo,
        amount,
        memberType,
        memberClass,
        membershipNo,
        validTill,
        gstTaxId,
        paymentMode,
        status: "Success",
        paidAt: new Date().toISOString(),
      }));

      paymentLogger.info("[ccavResponseHandler] Payment succeeded", {
        requestId: req.requestId,
        orderId,
        amount
      });

      return res.redirect(`${BASE_URL}/payment-status?status=success&data=${receiptData}`);
    }

    if (status === "Aborted") {
      paymentLogger.warn("[ccavResponseHandler] Payment aborted", {
        requestId: req.requestId,
        orderId
      });
      return res.redirect(`${BASE_URL}/payment-status?status=aborted&orderId=${orderId}`);
    }

    paymentLogger.warn("[ccavResponseHandler] Payment failed", {
      requestId: req.requestId,
      orderId,
      reason: failureMsg || "Payment failed"
    });

    return res.redirect(`${BASE_URL}/payment-status?status=failed&orderId=${orderId}&reason=${encodeURIComponent(failureMsg || "Payment failed")}`);
  } catch (err) {
    paymentLogger.error("[ccavResponseHandler] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.redirect(`${BASE_URL}/payment-status?status=failed`);
  }
});

const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
    root: path.join(__dirname, "../front"),
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(__dirname, "../front/dist");
  app.use(express.static(distPath));
  app.get("*path", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ccav") || req.path.startsWith("/uploads")) return next();
    return res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use(errorHandler);

const server = app.listen(PORT, () => {
  appLogger.info("[server] Server started", {
    url: `http://localhost:${PORT}`
  }, { forceConsole: true });
  appLogger.info("[server] CCAvenue environment loaded", {
    environment: process.env.CCAVENUE_ENV || "test"
  }, { forceConsole: true });
  appLogger.info("[server] Uploads path ready", {
    uploadsUrl: `http://localhost:${PORT}/uploads/`
  }, { forceConsole: true });
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  appLogger.warn("[shutdown] Shutdown requested", { signal });

  let exitCode = 0;

  try {
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (err) {
    exitCode = 1;
    appLogger.error("[shutdown] HTTP shutdown error", {
      signal,
      error: err.message,
      stack: err.stack
    });
  }

  if (redisClient.isOpen) {
    try {
      await redisClient.quit();
    } catch (err) {
      exitCode = 1;
      appLogger.error("[shutdown] Redis shutdown error", {
        signal,
        error: err.message,
        stack: err.stack
      });
    }
  }

  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.close();
    } catch (err) {
      exitCode = 1;
      appLogger.error("[shutdown] MongoDB shutdown error", {
        signal,
        error: err.message,
        stack: err.stack
      });
    }
  }

  process.exit(exitCode);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}
// Trigger nodemon reload for CCAvenue production credentials config.
