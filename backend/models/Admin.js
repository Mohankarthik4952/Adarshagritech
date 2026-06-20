import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    profileImage: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      default: null, // first-time password creation
    },
    role: {
      type: String,
      default: "ADMIN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
