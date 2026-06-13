import mongoose from "mongoose";

const requestLogSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  responseTimeMs: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    default: null
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  body: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  query: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  routeName: {
    type: String,
    required: true
  },
  handler: {
    type: String,
    required: true
  },
  requestId: {
    type: String,
    required: true
  },
  geoLocation: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  redactedFields: {
    type: [String],
    default: []
  }
}, {
  collection: "RequestLog",
  timestamps: true
});

requestLogSchema.index({ createdAt: -1 });
requestLogSchema.index({ requestId: 1 });
requestLogSchema.index({ routeName: 1, handler: 1, createdAt: -1 });

const RequestLog = mongoose.models.RequestLog || mongoose.model("RequestLog", requestLogSchema);

export default RequestLog;
