import "../config/env.js";
import mongoose from "mongoose";
import User from "../models/User.js";

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    const users = await User.find({}, "firstName lastName email role payments scrutinyStatus");
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}) [ID: ${u._id}] [Role: ${u.role}] [Scrutiny: ${u.scrutinyStatus}] [Payments count: ${u.payments ? u.payments.length : 0}]`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}
run();
