import mongoose from "mongoose";

/* =================================
   DEALER LEDGER SCHEMA
================================= */

const dealerLedgerSchema = new mongoose.Schema(
  {
    /* DEALER */

    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },

    /* PAYMENT AMOUNT */

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    /* PAYMENT METHOD */

    paymentMethod: {
      type: String,
      enum: ["UPI", "CASH"],
      required: true,
    },

    /* UTR NUMBER */

    utrNumber: {
      type: String,
      default: "",
      trim: true,
    },

    /* PAYMENT APP */

    paymentApp: {
      type: String,
      enum: ["PHONEPE", "GPAY", "PAYTM", ""],
      default: "",
    },

    /* CASH DETAILS */

    cashReceivedBy: {
      type: String,
      default: "",
      trim: true,
    },

    cashRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    /* SCREENSHOT */

    paymentProof: {
      type: String,
      default: "",
    },

    /* ADMIN VERIFICATION */

    status: {
      type: String,
      enum: ["PENDING", "VERIFICATION_PENDING", "APPROVED", "REJECTED"],
      default: "VERIFICATION_PENDING",
    },

    /* REJECTION */

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    /* APPROVED DATE */

    approvedAt: {
      type: Date,
      default: null,
    },

    /* PAYMENT DATE */

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/* =================================
   INDEXES
================================= */

dealerLedgerSchema.index({
  dealerId: 1,
});

dealerLedgerSchema.index({
  status: 1,
});

dealerLedgerSchema.index({
  paymentDate: -1,
});

/* =================================
   EXPORT
================================= */

const DealerLedger = mongoose.model("DealerLedger", dealerLedgerSchema);

export default DealerLedger;
