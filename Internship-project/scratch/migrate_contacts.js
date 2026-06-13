import "../config/env.js";
import mongoose from "mongoose";
import Contact from "../models/Contact.js";

async function run() {
  try {
    console.log("Connecting to MongoDB for contact migrations...");
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected successfully!");

    const contacts = await Contact.find();
    console.log(`Found ${contacts.length} total contact messages.`);

    let migratedCount = 0;
    for (const c of contacts) {
      let modified = false;

      if (!c.status) {
        c.status = "New";
        modified = true;
      }
      if (!c.notes) {
        c.notes = [];
        modified = true;
      }
      if (!c.actionLogs || c.actionLogs.length === 0) {
        c.actionLogs = [{
          action: "Inquiry Migrated",
          details: "Migrated legacy inquiry record to the new CRM format.",
          timestamp: c.createdAt || new Date()
        }];
        modified = true;
      }

      if (modified) {
        await c.save();
        migratedCount++;
        console.log(`Migrated contact from: ${c.name} (${c.email})`);
      }
    }

    console.log(`Migration completed. ${migratedCount} contacts updated.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Disconnected Mongoose.");
  }
}

run();
