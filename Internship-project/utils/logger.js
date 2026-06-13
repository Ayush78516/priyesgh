import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ConsoleLog from "../models/ConsoleLog.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, "..", "logs");
const streamCache = new Map();

fs.mkdirSync(logsDir, { recursive: true });

function isEnvTrue(name) {
  return String(process.env[name] || "").trim().toLowerCase() === "true";
}

function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function truncateString(value, maxLength = 2000) {
  if (typeof value !== "string" || value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...[truncated ${value.length - maxLength} chars]`;
}

function normalizeMeta(meta) {
  if (meta === undefined) {
    return undefined;
  }

  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: meta.stack
    };
  }

  if (meta === null || typeof meta !== "object" || Array.isArray(meta)) {
    return { value: meta };
  }

  return meta;
}

function safeStringify(value) {
  const seen = new WeakSet();

  return JSON.stringify(value, (_key, currentValue) => {
    if (currentValue instanceof Error) {
      return {
        name: currentValue.name,
        message: currentValue.message,
        stack: currentValue.stack
      };
    }

    if (Buffer.isBuffer(currentValue)) {
      return `[Buffer length=${currentValue.length}]`;
    }

    if (typeof currentValue === "string") {
      return truncateString(currentValue);
    }

    if (currentValue && typeof currentValue === "object") {
      if (seen.has(currentValue)) {
        return "[Circular]";
      }
      seen.add(currentValue);
    }

    return currentValue;
  });
}

function getStream(level) {
  const filePrefix = level === "ERROR" ? "error" : "info";
  const dateStamp = getDateStamp();
  const cacheKey = `${filePrefix}:${dateStamp}`;

  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey);
  }

  for (const key of streamCache.keys()) {
    if (key.startsWith(`${filePrefix}:`) && key !== cacheKey) {
      const oldStream = streamCache.get(key);
      oldStream.end();
      streamCache.delete(key);
    }
  }

  const filePath = path.join(logsDir, `${filePrefix}-${dateStamp}.log`);
  const stream = fs.createWriteStream(filePath, {
    flags: "a",
    encoding: "utf8"
  });

  streamCache.set(cacheKey, stream);
  return stream;
}

function writeToFile(level, line) {
  const stream = getStream(level);
  stream.write(`${line}\n`);
}

function writeToConsole(level, line) {
  if (level === "ERROR") {
    console.error(line);
    return;
  }

  if (level === "WARN") {
    console.warn(line);
    return;
  }

  if (level === "DEBUG") {
    console.debug(line);
    return;
  }

  console.log(line);
}

function shouldWriteToConsole(level, options = {}) {
  if (options.forceConsole) {
    return true;
  }

  if (level === "ERROR" || level === "WARN") {
    return true;
  }

  return isEnvTrue("LOG_ALL");
}

function persistConsoleLog(entry) {
  void ConsoleLog.create(entry).catch(() => {
    // File logging remains the durable fallback when MongoDB log writes fail.
  });
}

function buildLine({ timestamp, level, source, message, meta }) {
  const baseLine = `[${timestamp}] [${level}] [${source}] ${message}`;

  if (!meta || Object.keys(meta).length === 0) {
    return baseLine;
  }

  return `${baseLine} ${safeStringify(meta)}`;
}

function logWithLevel(source, level, message, meta, options = {}) {
  if (level === "DEBUG" && !isEnvTrue("LOG_DEBUG")) {
    return;
  }

  const timestamp = new Date().toISOString();
  const normalizedMessage = typeof message === "string"
    ? truncateString(message)
    : safeStringify(message);
  const normalizedMeta = normalizeMeta(meta);
  const line = buildLine({
    timestamp,
    level,
    source,
    message: normalizedMessage,
    meta: normalizedMeta
  });

  writeToFile(level, line);

  persistConsoleLog({
    level,
    source,
    message: normalizedMessage,
    meta: normalizedMeta,
    timestamp: new Date(timestamp)
  });

  if (shouldWriteToConsole(level, options)) {
    writeToConsole(level, line);
  }
}

export function shouldEmitRequestSummary() {
  return isEnvTrue("LOG_REQUESTS_TO_CONSOLE");
}

export function getLogsDirectory() {
  return logsDir;
}

export default function createLogger(source = "app") {
  const scope = source || "app";

  return {
    info(message, meta, options) {
      logWithLevel(scope, "INFO", message, meta, options);
    },
    warn(message, meta, options) {
      logWithLevel(scope, "WARN", message, meta, options);
    },
    error(message, meta, options) {
      logWithLevel(scope, "ERROR", message, meta, options);
    },
    debug(message, meta, options) {
      logWithLevel(scope, "DEBUG", message, meta, options);
    },
    log(message, meta, options) {
      logWithLevel(scope, "LOG", message, meta, options);
    }
  };
}
