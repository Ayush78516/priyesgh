import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const ActionLogSchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    performedByName: { type: String, default: "" },
    details: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "Follow Up", "Closed"], default: "New" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    followUpDate: { type: Date, default: null },
    notes: [NoteSchema],
    actionLogs: [ActionLogSchema],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Contact", ContactSchema);