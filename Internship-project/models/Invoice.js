import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  invoiceDate: { type: Date, default: Date.now },
  financialYear: { type: String, required: true },
  sequenceNumber: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paymentOrderId: { type: String, required: true }, // refers to User's payments orderId
  companySnapshot: {
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gstNumber: { type: String, required: true },
    state: { type: String, required: true },
    stateCode: { type: String, required: true },
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
    }
  },
  customerSnapshot: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyName: { type: String },
    billingAddress: { type: String },
    gstNumber: { type: String },
    state: { type: String, required: true },
    stateCode: { type: String, required: true }
  },
  items: [{
    description: { type: String, required: true },
    hsnSac: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableValue: { type: Number, required: true },
    gstPercent: { type: Number, required: true },
    cgstPercent: { type: Number, required: true },
    cgstAmount: { type: Number, required: true },
    sgstPercent: { type: Number, required: true },
    sgstAmount: { type: Number, required: true },
    igstPercent: { type: Number, required: true },
    igstAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true }
  }],
  totalTaxableValue: { type: Number, required: true },
  totalCGST: { type: Number, required: true },
  totalSGST: { type: Number, required: true },
  totalIGST: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Finalized", "Cancelled"], default: "Draft" },
  auditLogs: [{
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model("Invoice", InvoiceSchema);
