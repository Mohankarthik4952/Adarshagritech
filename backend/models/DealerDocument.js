import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    gstCertificate: String,

    shopPhoto: String,

    dealerSelfie: String,

    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("DealerDocument", schema);
