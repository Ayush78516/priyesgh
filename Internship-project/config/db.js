import { connect } from "mongoose";
import createLogger from "../utils/logger.js";

const logger = createLogger("app");

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URL);
    logger.info("[connectDB] MongoDB connected", {}, { forceConsole: true });
  } catch (err) {
    logger.error("[connectDB] MongoDB connection failed", {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

export default connectDB;
