import ConsoleLog from "../models/ConsoleLog.js";
import EmailLog from "../models/EmailLog.js";
import RequestLog from "../models/RequestLog.js";
import TermsAgreementLog from "../models/TermsAgreementLog.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("main-route");

function clampLimit(limit) {
  const parsedLimit = Number(limit) || 50;
  return Math.min(Math.max(parsedLimit, 1), 200);
}

function getPagination(body = {}) {
  const page = Math.max(Number(body.page) || 1, 1);
  const limit = clampLimit(body.limit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

function getSortDirection(sortDirection) {
  return String(sortDirection || "desc").toLowerCase() === "asc" ? 1 : -1;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDateRange(fromDate, toDate) {
  const dateRange = {};

  if (fromDate) {
    const startDate = new Date(fromDate);
    if (!Number.isNaN(startDate.getTime())) {
      dateRange.$gte = startDate;
    }
  }

  if (toDate) {
    const endDate = new Date(toDate);
    if (!Number.isNaN(endDate.getTime())) {
      if (!String(toDate).includes("T")) {
        endDate.setHours(23, 59, 59, 999);
      }
      dateRange.$lte = endDate;
    }
  }

  return Object.keys(dateRange).length ? dateRange : null;
}

function buildSearchFilter(search, fields) {
  if (!search) {
    return null;
  }

  const regex = new RegExp(escapeRegex(search), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex }))
  };
}

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return null;
}

async function queryLogs({
  req,
  res,
  model,
  dateField,
  searchableFields,
  exactFilters = [],
  booleanFilters = [],
  valueTransformers = {}
}) {
  const { page, limit, skip } = getPagination(req.body);
  const sortDirection = getSortDirection(req.body?.sortDirection);
  const filter = {};
  const dateRange = buildDateRange(req.body?.fromDate, req.body?.toDate);
  const searchFilter = buildSearchFilter(req.body?.search, searchableFields);

  if (dateRange) {
    filter[dateField] = dateRange;
  }

  for (const field of exactFilters) {
    if (req.body?.[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
      const transformer = valueTransformers[field];
      filter[field] = transformer ? transformer(req.body[field]) : req.body[field];
    }
  }

  for (const field of booleanFilters) {
    if (req.body?.[field] !== undefined) {
      const parsedValue = parseBoolean(req.body[field]);
      if (parsedValue !== null) {
        filter[field] = parsedValue;
      }
    }
  }

  const finalFilter = searchFilter
    ? { $and: [filter, searchFilter] }
    : filter;

  const [data, total] = await Promise.all([
    model.find(finalFilter)
      .sort({ [dateField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(finalFilter)
  ]);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
}

export const getRequestLogs = async (req, res) => {
  try {
    logger.info("[getRequestLogs] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return await queryLogs({
      req,
      res,
      model: RequestLog,
      dateField: "createdAt",
      searchableFields: ["url", "routeName", "handler", "requestId", "userId"],
      exactFilters: ["method", "status", "routeName", "handler", "requestId", "userId"],
      valueTransformers: {
        status: (value) => Number(value)
      }
    });
  } catch (error) {
    logger.error("[getRequestLogs] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getConsoleLogs = async (req, res) => {
  try {
    logger.info("[getConsoleLogs] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return await queryLogs({
      req,
      res,
      model: ConsoleLog,
      dateField: "timestamp",
      searchableFields: ["message", "source", "level"],
      exactFilters: ["level", "source"]
    });
  } catch (error) {
    logger.error("[getConsoleLogs] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getEmailLogs = async (req, res) => {
  try {
    logger.info("[getEmailLogs] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return await queryLogs({
      req,
      res,
      model: EmailLog,
      dateField: "createdAt",
      searchableFields: ["to", "subject", "action", "source", "requestId", "userId"],
      exactFilters: ["status", "action", "source", "requestId", "userId", "to"]
    });
  } catch (error) {
    logger.error("[getEmailLogs] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getTermsLogs = async (req, res) => {
  try {
    logger.info("[getTermsLogs] Request received", {
      requestId: req.requestId,
      userId: req.user?.id || null
    });

    return await queryLogs({
      req,
      res,
      model: TermsAgreementLog,
      dateField: "createdAt",
      searchableFields: ["action", "termsVersion", "source", "requestId", "userId"],
      exactFilters: ["action", "termsVersion", "source", "requestId", "userId"],
      booleanFilters: ["accepted"]
    });
  } catch (error) {
    logger.error("[getTermsLogs] Failed", {
      requestId: req.requestId,
      userId: req.user?.id || null,
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
