import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    trim: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  to: {
    type: String,
    default: null
  },
  subject: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["PENDING", "SENT", "FAILED", "SKIPPED"],
    required: true
  },
  requestId: {
    type: String,
    default: null
  },
  userId: {
    type: String,
    default: null
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  },
  error: {
    type: String,
    default: null
  }
}, {
  collection: "EmailLog",
  timestamps: true
});

emailLogSchema.index({ createdAt: -1 });
emailLogSchema.index({ status: 1, createdAt: -1 });

const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
