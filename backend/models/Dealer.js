import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema(
  {
    /* DEALER NAME */

    dealerName: {
      type: String,
      default: "",
      trim: true,
    },

    /* SHOP NAME */

    shopName: {
      type: String,
      default: "",
      trim: true,
    },

    /* GST NUMBER */

    gstNumber: {
      type: String,
      default: "",
      trim: true,
    },

    /* VILLAGE */

    village: {
      type: String,
      default: "",
      trim: true,
    },

    /* EMAIL */

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    /* PHONE */

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    /* PASSWORD */

    password: {
      type: String,
      default: "",
    },

    /* PROFILE IMAGE */

    profileImage: {
      type: String,
      default: null,
    },

    /* ROLE */

    role: {
      type: String,
      default: "DEALER",
    },

    /* ACTIVE STATUS */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* TERMS */

    termsAcceptedVersion: {
      type: Boolean,
      default: false,
    },

    /* RESET OTP */

    resetOTP: {
      type: String,
      default: null,
    },

    resetOTPExpiry: {
      type: Date,
      default: null,
    },

    /* GST CERTIFICATE */

    gstCertificate: {
      type: String,
      default: "",
    },

    /* SHOP PHOTO */

    shopPhoto: {
      type: String,
      default: "",
    },

    /* DEALER SELFIE */

    dealerSelfie: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Dealer", dealerSchema);
