import "./config/env.js";
import cors from "cors";
import express from "express";
import qs from "querystring";
import crypto from "crypto";
import connectDB from "./config/db.js";
import logRequest from "./middleware/logRequestMiddleware.js";
import { decrypt, encrypt } from "./ccavutil.js";
import createLogger from "./utils/logger.js";

const logger = createLogger("payment");
const app = express();

let BASE_URL = process.env.BASE_URL || "http://localhost:3000";
if (!BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = "http://" + BASE_URL;
}

function buildCorsConfig(baseUrl) {
  const allowedOrigins = new Set(["http://localhost:3000", "http://127.0.0.1:3000", "https://councilofvaluers.com"]);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  try {
    const parsedBaseUrl = new URL(baseUrl);
    allowedHosts.add(parsedBaseUrl.hostname);
    allowedOrigins.add(parsedBaseUrl.origin);
    allowedOrigins.add(`http://${parsedBaseUrl.hostname}`);
    allowedOrigins.add(`https://${parsedBaseUrl.hostname}`);

    if (parsedBaseUrl.port) {
      allowedOrigins.add(`http://${parsedBaseUrl.hostname}:${parsedBaseUrl.port}`);
      allowedOrigins.add(`https://${parsedBaseUrl.hostname}:${parsedBaseUrl.port}`);
    }
  } catch (error) {
    logger.warn("[cors] Failed to parse BASE_URL", {
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
        if (allowedHosts.has(parsedOrigin.hostname)) {
          callback(null, true);
          return;
        }
      } catch (error) {
        logger.warn("[cors] Failed to parse request origin", {
          origin,
          error: error.message
        });
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  };
}

await connectDB();

app.use(cors(buildCorsConfig(BASE_URL)));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY;
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE;
const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID;

const CCAV_URL = process.env.CCAVENUE_ENV === "production"
  ? "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  : "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

app.post("/ccavRequestHandler", logRequest("CCAvenue", "ccavRequestHandler"), (req, res) => {
  try {
    logger.info("[ccavRequestHandler] Request received", {
      requestId: req.requestId
    });

    const body = qs.stringify(req.body);
    const encRequest = encrypt(body, WORKING_KEY);
    const formBody = `
      <form id="nonseamless" method="post" name="redirect" action="${CCAV_URL}">
        <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
        <input type="hidden" name="access_code" id="access_code" value="${ACCESS_CODE}">
        <script language="javascript">document.redirect.submit();</script>
      </form>
    `;

    res.setHeader("Content-Type", "text/html");

    logger.info("[ccavRequestHandler] Redirect form generated", {
      requestId: req.requestId
    });

    return res.send(formBody);
  } catch (err) {
    logger.error("[ccavRequestHandler] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.status(500).send("Payment initiation failed: " + err.message);
  }
});

app.post("/ccavResponseHandler", logRequest("CCAvenue", "ccavResponseHandler"), (req, res) => {
  try {
    logger.info("[ccavResponseHandler] Request received", {
      requestId: req.requestId
    });

    const encResp = req.body.encResp;

    if (!encResp) {
      logger.warn("[ccavResponseHandler] Missing encrypted response", {
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

      fetch(`${BASE_URL}/api/payment/save`, {
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
        logger.error("[ccavResponseHandler] Failed to save payment", {
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

      logger.info("[ccavResponseHandler] Payment succeeded", {
        requestId: req.requestId,
        orderId,
        amount
      });

      return res.redirect(`${BASE_URL}/payment-status?status=success&data=${receiptData}`);
    }

    if (status === "Aborted") {
      logger.warn("[ccavResponseHandler] Payment aborted", {
        requestId: req.requestId,
        orderId
      });
      return res.redirect(`${BASE_URL}/payment-status?status=aborted&orderId=${orderId}`);
    }

    logger.warn("[ccavResponseHandler] Payment failed", {
      requestId: req.requestId,
      orderId,
      reason: failureMsg || "Payment failed"
    });

    return res.redirect(`${BASE_URL}/payment-status?status=failed&orderId=${orderId}&reason=${encodeURIComponent(failureMsg || "Payment failed")}`);
  } catch (err) {
    logger.error("[ccavResponseHandler] Failed", {
      requestId: req.requestId,
      error: err.message,
      stack: err.stack
    });
    return res.redirect(`${BASE_URL}/payment-status?status=failed`);
  }
});

app.listen(3001, () => {
  logger.info("[ccavServer] Server started", {
    url: "http://localhost:3001",
    merchantId: MERCHANT_ID,
    environment: process.env.CCAVENUE_ENV || "test",
    ccavUrl: CCAV_URL
  });
});
