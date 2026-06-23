import mongoose from "mongoose";

/* =================================
   RETURN ITEM SCHEMA
================================= */

const returnItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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

    orderedBottles: {
      type: Number,
      required: true,
      min: 1,
    },

    availableToReturn: {
      type: Number,
      required: true,
      min: 0,
    },

    returnQuantity: {
      type: Number,
      required: true,
      min: 1,
    },

    mrp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricePerBottle: {
      type: Number,
      required: true,
      min: 0,
    },

    gstPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    returnAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    productKey: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* =================================
   RETURN REQUEST SCHEMA
================================= */

const returnRequestSchema = new mongoose.Schema(
  {
    /* =================================
       DEALER DETAILS
    ================================= */

    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
      index: true,
    },

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

    dealerPhoneNumber: {
      type: String,
      default: "",
      trim: true,
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
      default: "MULTIPLE",
      trim: true,
    },

    /* =================================
       RETURN ITEMS
    ================================= */

    items: {
      type: [returnItemSchema],
      validate: {
        validator(items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: "At least one return item is required",
      },
    },

    /* =================================
       TOTALS
    ================================= */

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    /* =================================
       STATUS
    ================================= */

    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       APPROVAL DETAILS
    ================================= */

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    /* =================================
       RETURN INVOICE
    ================================= */

    returnInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    returnInvoiceNo: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =================================
   INDEXES
================================= */

returnRequestSchema.index({
  "items.orderId": 1,
});

returnRequestSchema.index({
  createdAt: -1,
});

returnRequestSchema.index({
  returnInvoiceId: 1,
});

returnRequestSchema.index({
  "items.productKey": 1,
});

/* =================================
   EXPORT
================================= */

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);

export default ReturnRequest;
