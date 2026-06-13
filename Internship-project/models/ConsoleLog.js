import mongoose from "mongoose";

const consoleLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ["INFO", "WARN", "DEBUG", "ERROR", "LOG"],
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "ConsoleLog",
  timestamps: true
});

consoleLogSchema.index({ timestamp: -1 });
consoleLogSchema.index({ level: 1, timestamp: -1 });
consoleLogSchema.index({ source: 1, timestamp: -1 });

const ConsoleLog = mongoose.models.ConsoleLog || mongoose.model("ConsoleLog", consoleLogSchema);

export default ConsoleLog;
