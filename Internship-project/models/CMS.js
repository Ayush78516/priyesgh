import mongoose from "mongoose";

const CMSSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "hero_banner_text", "home_banner_image"
  value: { type: String, required: true },
  type: { type: String, enum: ["text", "image"], default: "text" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("CMS", CMSSchema);
