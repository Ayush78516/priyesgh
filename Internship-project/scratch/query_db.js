// Created by Shekhar Kundra
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Invoice from "../models/Invoice.js";
import CompanyGSTProfile from "../models/CompanyGSTProfile.js";

// Load env
dotenv.config({ path: "../.env" });

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  console.log("Connecting to MONGO_URL:", mongoUrl ? "Found (URL hidden for security)" : "NOT FOUND");
  
  if (!mongoUrl) {
    throw new Error("MONGO_URL not found in environment variables");
  }

  await mongoose.connect(mongoUrl);
  console.log("Connected successfully to Atlas DB");

  const usersCount = await User.countDocuments();
  console.log(`Total users in DB: ${usersCount}`);

  // Find some users who have payments
  const usersWithPayments = await User.find({ "payments.0": { $exists: true } });
  console.log(`Found ${usersWithPayments.length} users with payments:`);

  for (const u of usersWithPayments) {
    console.log(`User: ${u.firstName} ${u.lastName} (${u._id}) - ${u.email}`);
    u.payments.forEach(p => {
      console.log(`  - OrderId: ${p.orderId}, Status: ${p.status}, Amount: ${p.amount}, Date: ${p.paidAt}`);
    });
  }

  const invoicesCount = await Invoice.countDocuments();
  console.log(`Total invoices in DB: ${invoicesCount}`);

  const profilesCount = await CompanyGSTProfile.countDocuments();
  console.log(`Total company profiles in DB: ${profilesCount}`);

  await mongoose.disconnect();
}

run().catch(console.error);
