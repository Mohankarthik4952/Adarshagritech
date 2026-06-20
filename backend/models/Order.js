import mongoose from "mongoose";

/* =================================
   ORDER ITEM SCHEMA
================================= */

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    productName: {
      type: String,
      trim: true,
      default: "",
    },

    size: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================
       CUSTOMER QUANTITY (BOTTLES)
    ================================= */

    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================
       DEALER QUANTITY (CASES)
    ================================= */

    cases: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    bottlesPerCase: {
      type: Number,
      default: 1,
      min: 1,
    },

    /* =================================
       RETURN TRACKING
    ================================= */

    returnedBottles: {
      type: Number,
      default: 0,
      min: 0,
    },

    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricePerBottle: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercent: {
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
   ORDER SCHEMA
================================= */

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      trim: true,
    },

    /* =================================
       USER DETAILS
    ================================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },

    userModel: {
      type: String,
      enum: ["Customer", "Dealer"],
      required: true,
    },

    role: {
      type: String,
      enum: ["DEALER", "CUSTOMER"],
      required: true,
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
       ORDER ITEMS
    ================================= */

    items: {
      type: [orderItemSchema],
      default: [],
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
       RETURN ADJUSTMENTS
    ================================= */

    totalReturnedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    returnAdjustedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================
       PAYMENT
    ================================= */

    paymentType: {
      type: String,
      enum: ["PAY_NOW", "PAY_LATER", "PAY_CASH", "CREDIT"],
      default: "PAY_NOW",
    },

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

    paymentApp: {
      type: String,
      enum: ["PHONEPE", "GPAY", "PAYTM", ""],
      default: "",
    },

    /* =================================
       PAYMENT DETAILS
    ================================= */

    paymentProof: {
      type: String,
      default: "",
    },

    utrNumber: {
      type: String,
      default: "",
      trim: true,
    },

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

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       DELIVERY
    ================================= */

    deliveryStatus: {
      type: String,
      enum: ["Pending Delivery", "Processing", "Shipped", "Delivered"],
      default: "Pending Delivery",
    },

    /* =================================
       ORDER STATUS
    ================================= */

    status: {
      type: String,
      enum: ["PLACED", "PROCESSING", "COMPLETED", "REJECTED"],
      default: "PLACED",
    },

    /* =================================
       DATES
    ================================= */

    paymentDate: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    /* =================================
       INVOICE
    ================================= */

    invoiceGenerated: {
      type: Boolean,
      default: false,
    },

    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      default: null,
    },

    invoiceFile: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

/* =================================
   VIRTUALS
================================= */

orderSchema.virtual("returnableItems").get(function () {
  return (this.items || []).map((item) => {
    const totalBottles =
      Number(item.cases || 0) * Number(item.bottlesPerCase || 1);

    const returnedBottles = Number(item.returnedBottles || 0);

    return {
      ...(item.toObject?.() || item),

      totalBottles,

      availableToReturn: Math.max(totalBottles - returnedBottles, 0),
    };
  });
});

/* =================================
   AUTO CALCULATE BALANCE
================================= */

orderSchema.pre("save", function () {
  this.totalAmount = Number(this.totalAmount || 0);

  this.paidAmount = Number(this.paidAmount || 0);

  this.totalReturnedAmount = Number(this.totalReturnedAmount || 0);

  this.returnAdjustedAmount = Number(this.returnAdjustedAmount || 0);

  this.balanceAmount = Math.max(
    this.totalAmount - this.paidAmount - this.returnAdjustedAmount,
    0,
  );

  if (this.balanceAmount <= 0) {
    this.paymentStatus = "RECEIVED";
  } else if (this.paidAmount > 0) {
    this.paymentStatus = "PARTIAL";
  } else if (this.paymentStatus !== "VERIFICATION_PENDING") {
    this.paymentStatus = "PENDING";
  }
});

/* =================================
   INDEXES
================================= */

orderSchema.index({ userId: 1 });

orderSchema.index({ userModel: 1 });

orderSchema.index({ role: 1 });

orderSchema.index({ orderNo: 1 }, { unique: true });

orderSchema.index({ paymentStatus: 1 });

orderSchema.index({ paymentType: 1 });

orderSchema.index({ status: 1 });

orderSchema.index({ deliveryStatus: 1 });

orderSchema.index({ invoiceGenerated: 1 });

orderSchema.index({ invoiceId: 1 });

orderSchema.index({ createdAt: -1 });

/* =================================
   EXPORT
================================= */

const Order = mongoose.model("Order", orderSchema);

export default Order;
