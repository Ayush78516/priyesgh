import "../config/env.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Invoice from "../models/Invoice.js";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully!");

    const users = await User.find();
    console.log(`\nFound ${users.length} users total.`);

    for (const u of users) {
      const payments = u.payments || [];
      if (payments.length > 0) {
        console.log(`\nUser: ${u.firstName} ${u.lastName} (${u.email}) [ID: ${u._id}]`);
        for (const p of payments) {
          const invoice = await Invoice.findOne({ paymentOrderId: p.orderId });
          console.log(`  - Order ID: ${p.orderId}`);
          console.log(`    Status: ${p.status}`);
          console.log(`    Amount: ${p.amount}`);
          console.log(`    Date: ${p.paidAt}`);
          console.log(`    Invoice Linked: ${invoice ? invoice.invoiceNumber : "None"}`);
        }
      }
    }

  } catch (error) {
    console.error("Error running script:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected.");
  }
}

run();
