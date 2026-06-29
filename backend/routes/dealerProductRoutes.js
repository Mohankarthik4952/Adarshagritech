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

      images: product.images || [],

      description: product.dealerDescription || "",

      dealerDiscountPercent: Number(product.dealerDiscountPercent || 0),

      gstPercent: Number(product.gstPercent || 0),

      sizes:
        product.sizes?.map((size) => {
          const price = Number(size.price || product.dealerPrice || 0);

          const discount = Number(product.dealerDiscountPercent || 0);

          const gst = Number(product.gstPercent || 0);

          const priceAfterDiscount = price - (price * discount) / 100;

          const gstAmount = (priceAfterDiscount * gst) / 100;

          return {
            size: size.size,

            mrp: Number(size.mrp || 0),

            price,

            bottlesPerCase: Number(size.bottlesPerCase || 1),

            stockQuantity: Number(size.stockQuantity || 0),

            acreCoverage: Number(size.acreCoverage || 1),

            finalPrice: Number((priceAfterDiscount + gstAmount).toFixed(2)),
          };
        }) || [],
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

      if (!product) continue;

      product.visibleToDealers = Boolean(item.selected);

      product.dealerDescription = item.description || "";

      product.dealerDiscountPercent = Number(item.discount || 0);

      product.gstPercent = Number(item.gstPercent || 0);

      product.dealerPrice = Number(item.price || 0);

      const stockQuantity = Number(item.stockQuantity || 0);

      if (Array.isArray(product.sizes)) {
        product.sizes.forEach((size) => {
          size.stockQuantity = stockQuantity;

          size.price = Number(item.price || 0);
        });

        product.markModified("sizes");
      }

      const price = Number(item.price || 0);

      const discount = (price * Number(item.discount || 0)) / 100;

      const afterDiscount = price - discount;

      const gstAmount = (afterDiscount * Number(item.gstPercent || 0)) / 100;

      product.dealerFinalPrice = Number((afterDiscount + gstAmount).toFixed(2));

      await product.save();

      console.log("================================");
      console.log("UPDATED:", product.name);
      console.log("Price:", product.dealerPrice);
      console.log("Final:", product.dealerFinalPrice);
      console.log(
        product.sizes.map((size) => ({
          size: size.size,
          price: size.price,
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
