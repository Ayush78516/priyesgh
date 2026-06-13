import "../config/env.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Invoice from "../models/Invoice.js";
import { generateInvoice } from "../controllers/gstController.js";

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully!");

    // We will target Shekhar Kundra and other test accounts to add a Completed payment and generate a GST Invoice for it.
    const targetEmails = [
      {
        email: "shekhar.kundra@gmail.com",
        state: "Delhi",
        stateCode: "07",
        pincode: "110001",
        addressLine: "Flat 4B, Connaught Place",
        city: "New Delhi"
      },
      {
        email: "shekhar.k1undra@gmail.com",
        state: "Maharashtra",
        stateCode: "27",
        pincode: "400001",
        addressLine: "123 Marine Drive",
        city: "Mumbai"
      },
      {
        email: "invincibleone1137@gmail.com",
        state: "Delhi",
        stateCode: "07",
        pincode: "110025",
        addressLine: "Pocket A, Okhla",
        city: "New Delhi"
      }
    ];

    for (const target of targetEmails) {
      console.log(`\nProcessing target: ${target.email}`);
      const user = await User.findOne({ email: target.email });
      if (!user) {
        console.log(`User not found with email: ${target.email}, skipping.`);
        continue;
      }

      // Check if user already has a Completed payment
      const existingCompleted = user.payments.find(p => p.status === "Completed" || p.status === "Success");
      if (existingCompleted) {
        console.log(`User already has a completed payment: ${existingCompleted.orderId}. Checking if invoice exists...`);
        const inv = await Invoice.findOne({ paymentOrderId: existingCompleted.orderId });
        if (inv) {
          console.log(`Invoice already exists for this payment: ${inv.invoiceNumber}.`);
          continue;
        } else {
          console.log(`No invoice found for existing payment. Generating now...`);
          try {
            const invoice = await generateInvoice(user._id.toString(), existingCompleted.orderId);
            console.log(`Invoice generated successfully: ${invoice.invoiceNumber}`);
          } catch (err) {
            console.error(`Failed to generate invoice for existing payment:`, err.message);
          }
          continue;
        }
      }

      // No completed payment, let's update address and add a Completed payment
      console.log(`Setting billing/address details for target to state: ${target.state}`);
      user.permAddress = {
        line1: target.addressLine,
        line2: "",
        city: target.city,
        state: target.state,
        district: target.city,
        pincode: target.pincode
      };
      
      // Also add to gstDetails
      user.gstDetails = {
        gstNumber: "",
        companyName: "",
        state: target.state,
        stateCode: target.stateCode,
        billingAddress: `${target.addressLine}, ${target.city}, ${target.state} - ${target.pincode}`
      };

      const uniqueId = Math.floor(100000 + Math.random() * 900000);
      const newOrderId = `COV_OLD_${uniqueId}`;
      const newPayment = {
        orderId: newOrderId,
        trackingId: `TRK${uniqueId}`,
        bankRefNo: `REF${uniqueId}`,
        amount: "3000.00",
        memberType: "Annual",
        memberClass: "Chartered",
        membershipNo: `COV-MEM-${uniqueId}`,
        validTill: "2027-05-15",
        paymentMode: "Online",
        cardName: "Visa",
        status: "Completed",
        paidAt: new Date("2026-05-15T12:00:00.000Z") // May 15, 2026 (old payment)
      };

      user.payments.push(newPayment);
      await user.save();
      console.log(`Added completed payment ${newOrderId} and saved user.`);

      // Now generate invoice
      console.log(`Generating invoice for ${newOrderId}...`);
      try {
        const invoice = await generateInvoice(user._id.toString(), newOrderId);
        console.log(`Invoice generated successfully: ${invoice.invoiceNumber}`);
      } catch (err) {
        console.error(`Failed to generate invoice:`, err.message);
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
