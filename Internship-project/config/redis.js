import { createClient } from "redis";
import "./env.js";
import createLogger from "../utils/logger.js";

const logger = createLogger("app");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

redisClient.on("error", (err) => {
  logger.error("[redis] Redis client error", {
    error: err.message,
    stack: err.stack
  });
});

redisClient.on("connect", () => {
  logger.info("[redis] Redis connected", {}, { forceConsole: true });
});

try {
  await redisClient.connect();
} catch (err) {
  logger.error("[redis] Redis connection failed", {
    error: err.message,
    stack: err.stack
  });
  throw err;
}

export default redisClient;
