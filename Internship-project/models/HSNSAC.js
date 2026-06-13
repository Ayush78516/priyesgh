import mongoose from "mongoose";

const HSNSACSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g. "9983"
  type: { type: String, enum: ["Goods", "Services"], required: true },
  taxRate: { type: mongoose.Schema.Types.ObjectId, ref: "GSTTax", required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("HSNSAC", HSNSACSchema);
