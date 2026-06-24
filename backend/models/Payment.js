import mongoose from "mongoose";

/* =================================
   PAYMENT SCHEMA
================================= */

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      default: null,
      index: true,
    },

    role: {
      type: String,
      enum: ["DEALER", "CUSTOMER"],
      required: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    orderNo: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
      index: true,
    },

    invoiceNo: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    customerName: {
      type: String,
      trim: true,
      default: "",
    },

    customerPhoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    dealerName: {
      type: String,
      trim: true,
      default: "",
    },

    dealerPhoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================
       PAYMENT CATEGORY
    ================================= */

    paymentCategory: {
      type: String,
      enum: ["ORDER_PAYMENT", "OUTSTANDING_PAYMENT"],
      default: "ORDER_PAYMENT",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    paymentType: {
      type: String,
      enum: ["UPI", "CASH", "CREDIT"],
      required: true,
    },

    paymentApp: {
      type: String,
      enum: ["PHONEPE", "GPAY", "PAYTM", ""],
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "VERIFICATION_PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    utrNumber: {
      type: String,
      trim: true,
      default: "",
    },

    paymentProof: {
      type: String,
      default: "",
    },

    cashReceivedBy: {
      type: String,
      trim: true,
      default: "",
    },

    cashRemarks: {
      type: String,
      trim: true,
      default: "",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    companyUpiId: {
      type: String,
      trim: true,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

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
   COMPOUND INDEXES
================================= */

paymentSchema.index({
  userId: 1,
  paymentCategory: 1,
});

paymentSchema.index({
  role: 1,
  status: 1,
});

paymentSchema.index({
  userId: 1,
  status: 1,
});

paymentSchema.index({
  paymentCategory: 1,
  status: 1,
});

paymentSchema.index({
  createdAt: -1,
});

/* =================================
   EXPORT
================================= */

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
