import "../config/env.js";
import mongoose from "mongoose";
import CompanyGSTProfile from "../models/CompanyGSTProfile.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const profiles = await CompanyGSTProfile.find();
    console.log("Company GST Profiles count:", profiles.length);
    profiles.forEach(p => {
      console.log("- Profile:", p.companyName);
      console.log("  GSTIN:", p.gstNumber);
      console.log("  State:", p.state);
      console.log("  State Code:", p.stateCode);
      console.log("  Is Default:", p.isDefault);
      console.log("  Is Active:", p.isActive);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}
run();
