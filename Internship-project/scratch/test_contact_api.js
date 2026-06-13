import "../config/env.js";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js";

async function run() {
  try {
    console.log("Connecting to MongoDB for API verification...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully!");

    const admin = await User.findOne({ role: "super-admin" });
    if (!admin) {
      console.error("Super Admin user not found. Run seedAdmin first.");
      return;
    }
    console.log(`Found Admin: ${admin.firstName} ${admin.lastName} [ID: ${admin._id}]`);

    const lead = await Contact.findOne();
    if (!lead) {
      console.log("No contact inquiries found in database to test.");
      return;
    }

    console.log(`\nTesting CRM transitions on Lead from: ${lead.name}`);
    console.log(`Initial Status: ${lead.status}`);
    console.log(`Initial Notes Count: ${lead.notes.length}`);

    // 1. Simulate note addition
    lead.notes.push({
      content: "Called client. Discussed cooperative valuation requirements. Scheduling follow-up.",
      createdBy: admin._id,
      createdByName: `${admin.firstName} ${admin.lastName}`,
      createdAt: new Date()
    });
    lead.actionLogs.push({
      action: "Note Added",
      performedBy: admin._id,
      performedByName: `${admin.firstName} ${admin.lastName}`,
      details: "Added follow-up notes via API verification script."
    });

    // 2. Simulate status change
    lead.status = "Follow Up";
    lead.actionLogs.push({
      action: "Status Changed",
      performedBy: admin._id,
      performedByName: `${admin.firstName} ${admin.lastName}`,
      details: "Status transitioned from 'New' to 'Follow Up'."
    });

    // 3. Simulate assignment & scheduling
    lead.assignedTo = admin._id;
    lead.followUpDate = new Date("2026-06-05T12:00:00Z");
    lead.actionLogs.push({
      action: "Assignment Updated",
      performedBy: admin._id,
      performedByName: `${admin.firstName} ${admin.lastName}`,
      details: `Assigned inquiry to ${admin.firstName} ${admin.lastName}. Scheduled follow-up for 05/06/2026.`
    });

    await lead.save();
    console.log("Lead saved successfully after CRM transitions!");

    // Re-query and print
    const updatedLead = await Contact.findById(lead._id).populate("assignedTo", "firstName lastName");
    console.log(`\nVerification Results:`);
    console.log(`Status: ${updatedLead.status} (Expected: Follow Up)`);
    console.log(`Assigned To: ${updatedLead.assignedTo ? updatedLead.assignedTo.firstName : "None"} (Expected: ${admin.firstName})`);
    console.log(`Follow-up Date: ${updatedLead.followUpDate}`);
    console.log(`Notes logged:`);
    updatedLead.notes.forEach((n, idx) => console.log(`  [Note ${idx+1}] by ${n.createdByName}: "${n.content}"`));
    console.log(`Audit log length: ${updatedLead.actionLogs.length}`);
    updatedLead.actionLogs.forEach((l, idx) => console.log(`  [Log ${idx+1}] ${l.action} by ${l.performedByName || "System"}: ${l.details}`));

  } catch (error) {
    console.error("CRM Test failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected.");
  }
}

run();
