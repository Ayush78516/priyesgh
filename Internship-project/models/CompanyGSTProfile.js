import mongoose from "mongoose";

const CompanyGSTProfileSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  companyAddress: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  gstNumber: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  stateCode: { type: String, required: true }, // e.g. "27" for Maharashtra
  pan: { type: String },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    branchName: { type: String }
  },
  authorizedSignatory: {
    name: { type: String },
    designation: { type: String },
    signatureUrl: { type: String }
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("CompanyGSTProfile", CompanyGSTProfileSchema);
