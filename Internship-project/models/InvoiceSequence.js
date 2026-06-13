import mongoose from "mongoose";

const InvoiceSequenceSchema = new mongoose.Schema({
  financialYear: { type: String, required: true }, // e.g. "2026-27"
  prefix: { type: String, default: "COV" },
  // Legacy counter field retained for backward compatibility.
  nextSequenceNumber: { type: Number, default: 1 },
  // Canonical counter used by new allocator logic.
  lastSequenceNumber: { type: Number, default: 0 }
});

InvoiceSequenceSchema.index({ financialYear: 1, prefix: 1 }, { unique: true });

export default mongoose.model("InvoiceSequence", InvoiceSequenceSchema);
