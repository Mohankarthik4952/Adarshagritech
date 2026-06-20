import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* =========================================
   GET DEALER PRODUCTS
========================================= */

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      visibleToDealers: true,
      isActive: true,
    }).sort({ createdAt: -1 });

    const formattedProducts = products.map((product) => ({
      _id: product._id,

      productId: product.productId,

      name: product.name,

      // FIX: use images instead of image
      images: product.images || [],

      description: product.dealerDescription || "",

      dealerDiscountPercent: Number(product.dealerDiscountPercent) || 0,

      gstPercent: Number(product.gstPercent) || 0,

      dealerFinalPrice: product.sizes.map((size) => {
        const mrp = Number(size.mrp || 0);

        const discount = Number(product.dealerDiscountPercent || 0);

        const gst = Number(product.gstPercent || 0);

        const priceAfterDiscount = mrp - (mrp * discount) / 100;

        const gstAmount = (priceAfterDiscount * gst) / 100;

        return {
          size: size.size,
          finalPrice: Number((priceAfterDiscount + gstAmount).toFixed(2)),
        };
      }),

      sizes:
        product.sizes?.map((size) => ({
          size: size.size,

          mrp: Number(size.mrp) || 0,

          bottlesPerCase: Number(size.bottlesPerCase) || 1,

          stockQuantity: Number(size.stockQuantity) || 0,

          acreCoverage: Number(size.acreCoverage) || 1,
        })) || [],
    }));

    return res.status(200).json(formattedProducts);
  } catch (error) {
    console.log("GET DEALER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dealer products",
    });
  }
});

/* =========================================
   SAVE DEALER PRODUCTS
========================================= */

router.post("/", async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Products array is required",
      });
    }

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        console.log("PRODUCT NOT FOUND:", item.productId);
        continue;
      }

      product.visibleToDealers = Boolean(item.selected);

      product.dealerDescription = item.description || "";

      product.dealerDiscountPercent = Number(item.discount || 0);

      product.gstPercent = Number(item.gstPercent || 0);

      const stockQuantity = Number(item.stockQuantity || 0);

      /* =========================
         UPDATE STOCK FOR ALL SIZES
      ========================= */

      if (Array.isArray(product.sizes)) {
        product.sizes.forEach((size) => {
          size.stockQuantity = stockQuantity;
        });

        product.markModified("sizes");
      }

      /* =========================
         CALCULATE FINAL PRICE
      ========================= */

      if (product.sizes?.length > 0) {
        const mrp = Number(product.sizes[0]?.mrp || 0);

        const discount = Number(product.dealerDiscountPercent || 0);

        const gst = Number(product.gstPercent || 0);

        const priceAfterDiscount = mrp - (mrp * discount) / 100;

        const gstAmount = (priceAfterDiscount * gst) / 100;

        product.dealerFinalPrice = Number(
          (priceAfterDiscount + gstAmount).toFixed(2),
        );
      }

      await product.save();

      console.log("================================");
      console.log("UPDATED:", product.name);
      console.log(
        product.sizes.map((size) => ({
          size: size.size,
          stockQuantity: size.stockQuantity,
        })),
      );
      console.log("================================");
    }

    return res.status(200).json({
      success: true,
      message: "Dealer products saved successfully",
    });
  } catch (error) {
    console.log("SAVE DEALER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save dealer products",
    });
  }
});

export default router;
