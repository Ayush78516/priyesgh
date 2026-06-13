import "../config/env.js";
import mongoose from "mongoose";
import GSTTax from "../models/GSTTax.js";
import HSNSAC from "../models/HSNSAC.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const taxes = await GSTTax.find();
    console.log("GST Taxes:");
    taxes.forEach(t => {
      console.log(`- ${t.name}: GST ${t.gstPercentage}%, CGST ${t.cgstPercentage}%, SGST ${t.sgstPercentage}%, IGST ${t.igstPercentage}%`);
    });

    const codes = await HSNSAC.find().populate("taxRate");
    console.log("\nHSN/SAC Codes:");
    codes.forEach(c => {
      console.log(`- Code: ${c.code}, Type: ${c.type}, Tax Rate: ${c.taxRate ? c.taxRate.name : "None"}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}
run();
