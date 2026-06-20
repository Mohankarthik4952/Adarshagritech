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
    const mrp = Number(this.sizes[0]?.mrp || 0);

    /* GST */

    this.gstAmount = (mrp * Number(this.gstPercent || 0)) / 100;

    /* DEALER FINAL PRICE */

    this.dealerFinalPrice =
      mrp - Number(this.dealerDiscountValue || 0) + this.gstAmount;

    /* CUSTOMER FINAL PRICE */

    this.customerFinalPrice =
      mrp - (mrp * Number(this.customerDiscountPercent || 0)) / 100;
  }
});

/* =================================
   EXPORT MODEL
================================= */

const Product = mongoose.model("Product", productSchema);

export default Product;
