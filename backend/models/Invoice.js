import mongoose from "mongoose";

/* =================================
   INVOICE ITEM SCHEMA
================================= */

const invoiceItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    size: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

/* =================================
   INVOICE SCHEMA
================================= */

const invoiceSchema = new mongoose.Schema(
  {
    /* =================================
       INVOICE DETAILS
    ================================= */

    invoiceNo: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceType: {
      type: String,
      enum: ["FINAL", "RETURN"],
      default: "FINAL",
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    /* =================================
       ORDER DETAILS
    ================================= */

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    orderNo: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       RETURN DETAILS
    ================================= */

    parentInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    returnRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnRequest",
      default: null,
    },

    /* =================================
       USER DETAILS
    ================================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    role: {
      type: String,
      enum: ["DEALER", "CUSTOMER"],
      required: true,
    },

    /* =================================
       PAYMENT TYPE
    ================================= */

    paymentType: {
      type: String,
      enum: ["PAY_NOW", "PAY_LATER", "PAY_CASH", "CREDIT"],
      default: "PAY_NOW",
    },

    /* =================================
       DEALER DETAILS
    ================================= */

    dealerName: {
      type: String,
      default: "",
      trim: true,
    },

    shopName: {
      type: String,
      default: "",
      trim: true,
    },

    dealerGSTNumber: {
      type: String,
      default: "",
      trim: true,
    },

    dealerPhoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       CUSTOMER DETAILS
    ================================= */

    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    customerPhoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    customerVillage: {
      type: String,
      default: "",
      trim: true,
    },

    customerPincode: {
      type: String,
      default: "",
      trim: true,
    },

    customerNearBusStand: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       COMPANY DETAILS
    ================================= */

    companyName: {
      type: String,
      default: "Adarsh Agri Tech",
      trim: true,
    },

    companyGSTNumber: {
      type: String,
      default: "",
      trim: true,
    },

    companyPhoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    companyAddress: {
      type: String,
      default: "",
      trim: true,
    },

    bankDetails: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       PRODUCTS
    ================================= */

    items: {
      type: [invoiceItemSchema],
      default: [],
    },

    /* =================================
       TOTALS
    ================================= */

    subTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================
       RETURN ADJUSTMENTS
    ================================= */

    returnAdjustedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalReturnedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================
       PAYMENT
    ================================= */

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "VERIFICATION_PENDING",
        "PARTIAL",
        "RECEIVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    /* =================================
       INVOICE STATUS
    ================================= */

    invoiceStatus: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID"],
      default: "UNPAID",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================
       LOCK
    ================================= */

    isLocked: {
      type: Boolean,
      default: false,
    },

    /* =================================
       PDF
    ================================= */

    pdfUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.pre("save", function () {
  this.subTotal = Number(this.subTotal || 0);

  this.grandTotal = Number(this.grandTotal || 0);

  this.paidAmount = Number(this.paidAmount || 0);

  this.returnAdjustedAmount = Number(this.returnAdjustedAmount || 0);

  this.totalReturnedAmount = Number(this.totalReturnedAmount || 0);

  this.balanceAmount = Math.max(
    this.grandTotal - this.paidAmount - this.returnAdjustedAmount,
    0,
  );

  if (this.balanceAmount <= 0) {
    this.invoiceStatus = "PAID";
    this.paymentStatus = "RECEIVED";
  } else if (this.paidAmount > 0) {
    this.invoiceStatus = "PARTIALLY_PAID";
    this.paymentStatus = "PARTIAL";
  } else if (this.paymentStatus !== "VERIFICATION_PENDING") {
    this.invoiceStatus = "UNPAID";
    this.paymentStatus = "PENDING";
  }
});

/* =================================
   INDEXES
================================= */

invoiceSchema.index({ orderId: 1 });

invoiceSchema.index({ orderNo: 1 });

invoiceSchema.index({ invoiceNo: 1 }, { unique: true });

invoiceSchema.index({ userId: 1 });

invoiceSchema.index({ role: 1 });

invoiceSchema.index({ invoiceType: 1 });

invoiceSchema.index({ parentInvoiceId: 1 });

invoiceSchema.index({ returnRequestId: 1 });

invoiceSchema.index({ paymentType: 1 });

invoiceSchema.index({ invoiceStatus: 1 });

invoiceSchema.index({ paymentStatus: 1 });

invoiceSchema.index({ customerPhoneNumber: 1 });

invoiceSchema.index({ customerName: 1 });

invoiceSchema.index({ createdAt: -1 });

/* =================================
   EXPORT
================================= */

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
