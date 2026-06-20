import mongoose from "mongoose";

const termsSchema = new mongoose.Schema(
  {
    fileUrl: String,
  },
  { timestamps: true },
);

export default mongoose.model("Terms", termsSchema);
