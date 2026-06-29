// models/Product.js

import mongoose from "mongoose";

/* =================================
   SIZE SCHEMA
================================= */

const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    acreCoverage: {
      type: Number,
      default: 1,
      min: 1,
    },

    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    bottlesPerCase: {
      type: Number,
      required: true,
      min: 1,
    },

    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
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
   PRODUCT SCHEMA
================================= */

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    dealerSelectedSize: {
      type: String,
      default: "",
    },

    customerSelectedSize: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "General",
      trim: true,
    },

    sizes: {
      type: [sizeSchema],
      default: [],
    },

    stockStatus: {
      type: String,
      enum: ["AVAILABLE", "NOT_AVAILABLE"],
      default: "AVAILABLE",
      uppercase: true,
    },

    visibleToDealers: {
      type: Boolean,
      default: false,
    },

    visibleToCustomers: {
      type: Boolean,
      default: false,
    },

    dealerDescription: {
      type: String,
      default: "",
      trim: true,
    },

    customerDescription: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================
       DEALER PRICING
    ================================= */
    dealerPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    dealerDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    dealerDiscountValue: {
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
    },

    dealerFinalPrice: {
      type: Number,
      default: 0,
    },

    /* =================================
       CUSTOMER PRICING
    ================================= */
    customerPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    customerDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    customerDiscountValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    customerFinalPrice: {
      type: Number,
      default: 0,
    },

    /* =================================
       STATUS
    ================================= */

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

/* =================================
   AUTO CALCULATIONS
================================= */

productSchema.pre("save", function () {
  this.dealerDiscountPercent = Math.min(
    100,
    Math.max(0, Number(this.dealerDiscountPercent || 0)),
  );

  this.customerDiscountPercent = Math.min(
    100,
    Math.max(0, Number(this.customerDiscountPercent || 0)),
  );

  if (this.sizes?.length > 0) {
    const dealerSize =
      this.sizes.find((size) => size.size === this.dealerSelectedSize) ||
      this.sizes[0];

    const customerSize =
      this.sizes.find((size) => size.size === this.customerSelectedSize) ||
      this.sizes[0];

    const dealerMrp = Number(dealerSize?.mrp || 0);

    const customerMrp = Number(customerSize?.mrp || 0);

    const dealerPrice = Number(
      this.dealerPrice || dealerSize?.price || dealerMrp,
    );

    const customerPrice = Number(
      this.customerPrice || customerSize?.price || customerMrp,
    );

    /* DEALER FINAL PRICE */

    const dealerDiscount =
      (dealerPrice * Number(this.dealerDiscountPercent || 0)) / 100;

    this.dealerDiscountValue = dealerDiscount;

    this.gstAmount =
      ((dealerPrice - dealerDiscount) * Number(this.gstPercent || 0)) / 100;

    this.dealerFinalPrice = dealerPrice - dealerDiscount + this.gstAmount;

    /* CUSTOMER FINAL PRICE */

    const customerDiscount =
      (customerPrice * Number(this.customerDiscountPercent || 0)) / 100;

    this.customerDiscountValue = customerDiscount;

    this.customerFinalPrice = customerPrice - customerDiscount;
  }
});

/* =================================
   EXPORT MODEL
================================= */

const Product = mongoose.model("Product", productSchema);

export default Product;
