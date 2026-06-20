// backend/models/PriceList.js

import mongoose from "mongoose";

const priceListSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("PriceList", priceListSchema);
