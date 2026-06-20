import mongoose from "mongoose";

const socialSchema = new mongoose.Schema(
  {
    whatsapp: String,
    youtube: String,
    instagram: String,
  },
  { timestamps: true },
);

export default mongoose.model("SocialLinks", socialSchema);
