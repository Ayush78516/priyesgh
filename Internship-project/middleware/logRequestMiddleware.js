import { randomUUID } from "crypto";
import RequestLog from "../models/RequestLog.js";
import createLogger, { shouldEmitRequestSummary } from "../utils/logger.js";

const logger = createLogger("request-logger");
const DEFAULT_REDACTED_FIELDS = ["password", "oldpassword", "newpassword", "token"];
const DEFAULT_REDACTED_HEADERS = ["authorization", "cookie", "set-cookie", "x-api-key"];

function truncateString(value, maxLength = 2000) {
  if (typeof value !== "string" || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...[truncated ${value.length - maxLength} chars]`;
}

function sanitizeValue(value, sensitiveKeys, redactedFields) {
  if (value === null || value === undefined) {
    return value;
  }

  if (Buffer.isBuffer(value)) {
    return `[Buffer length=${value.length}]`;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, sensitiveKeys, redactedFields));
  }

  if (typeof value === "string") {
    return truncateString(value);
  }

  if (typeof value !== "object") {
    return value;
  }

  const sanitizedObject = {};

  for (const [key, currentValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();

    if (sensitiveKeys.has(normalizedKey)) {
      redactedFields.add(key);
      sanitizedObject[key] = "[REDACTED]";
      continue;
    }

    sanitizedObject[key] = sanitizeValue(currentValue, sensitiveKeys, redactedFields);
  }

  return sanitizedObject;
}

function getRequestIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function getUserId(req) {
  return req.user?.id
    || req.user?._id
    || req.body?.UserId
    || req.body?.userId
    || null;
}

export default function logRequest(routeName, handler, options = {}) {
  return (req, res, next) => {
    req.requestId = req.requestId || randomUUID();
    req.routeName = routeName;
    req.handlerName = handler;

    const startedAt = process.hrtime.bigint();

    res.once("finish", () => {
      const redactedFields = new Set();
      const bodySensitiveKeys = new Set([
        ...DEFAULT_REDACTED_FIELDS,
        ...(options.redactedFields || [])
      ].map((field) => String(field).toLowerCase()));
      const headerSensitiveKeys = new Set(DEFAULT_REDACTED_HEADERS);
      const responseTimeMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const requestPayload = {
        method: req.method,
        url: req.originalUrl || req.url,
        status: res.statusCode,
        responseTimeMs: Number(responseTimeMs.toFixed(2)),
        userId: getUserId(req),
        ip: getRequestIp(req),
        userAgent: req.get("user-agent") || null,
        headers: sanitizeValue(req.headers, headerSensitiveKeys, redactedFields),
        body: sanitizeValue(req.body, bodySensitiveKeys, redactedFields),
        query: sanitizeValue(req.query, bodySensitiveKeys, redactedFields),
        routeName,
        handler,
        requestId: req.requestId,
        geoLocation: req.geoLocation || null,
        redactedFields: Array.from(redactedFields)
      };

      void RequestLog.create(requestPayload).catch((error) => {
        logger.error("[logRequest] Failed to persist request log", {
          requestId: req.requestId,
          routeName,
          handler,
          error: error.message,
          stack: error.stack
        });
      });

      if (!shouldEmitRequestSummary()) {
        return;
      }

      logger.info(
        `[${req.method}] ${req.originalUrl || req.url} ${res.statusCode} ${responseTimeMs.toFixed(2)}ms`,
        {
          requestId: req.requestId,
          userId: requestPayload.userId,
          routeName,
          handler
        },
        { forceConsole: true }
      );
    });

    next();
  };
}
