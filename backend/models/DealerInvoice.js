import mongoose from "mongoose";

const dealerInvoiceSchema = new mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    fileUrl: String,
  },
  { timestamps: true },
);

export default mongoose.model("DealerInvoice", dealerInvoiceSchema);
