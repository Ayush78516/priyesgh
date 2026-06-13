import mongoose from "mongoose";

const termsAgreementLogSchema = new mongoose.Schema({
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
  accepted: {
    type: Boolean,
    default: true
  },
  termsVersion: {
    type: String,
    default: null
  },
  requestId: {
    type: String,
    default: null
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
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  }
}, {
  collection: "TermsAgreementLog",
  timestamps: true
});

termsAgreementLogSchema.index({ createdAt: -1 });
termsAgreementLogSchema.index({ userId: 1, createdAt: -1 });

const TermsAgreementLog = mongoose.models.TermsAgreementLog || mongoose.model("TermsAgreementLog", termsAgreementLogSchema);

export default TermsAgreementLog;
