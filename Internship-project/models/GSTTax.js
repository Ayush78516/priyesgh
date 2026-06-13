import mongoose from "mongoose";

const GSTTaxSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "GST 18%"
  gstPercentage: { type: Number, required: true }, // e.g. 18
  cgstPercentage: { type: Number, required: true }, // e.g. 9
  sgstPercentage: { type: Number, required: true }, // e.g. 9
  igstPercentage: { type: Number, required: true }, // e.g. 18
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("GSTTax", GSTTaxSchema);
