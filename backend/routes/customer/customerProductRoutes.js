import express from "express";
import Product from "../../models/Product.js";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = express.Router();

/* =========================================
   GET CUSTOMER PRODUCTS
========================================= */

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({
      visibleToCustomers: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log("CUSTOMER PRODUCTS:", products.length);

    const formattedProducts = products.map((product) => {
      let sizeData = null;

      if (product.customerSelectedSize && Array.isArray(product.sizes)) {
        sizeData = product.sizes.find(
          (size) => size.size === product.customerSelectedSize,
        );
      }

      if (!sizeData && product.sizes?.length > 0) {
        sizeData = product.sizes[0];
      }

      const mrp = Number(sizeData?.mrp || 0);

      const discount = Math.min(
        Math.max(Number(product.customerDiscountPercent || 0), 0),
        100,
      );

      const finalPrice = Number((mrp - (mrp * discount) / 100).toFixed(2));

      /* =========================
         IMAGE FIX
      ========================= */

      let imagePath = "";

      if (product.image) {
        imagePath = product.image;
      } else if (Array.isArray(product.images) && product.images.length > 0) {
        imagePath = product.images[0];
      }

      if (imagePath && !imagePath.startsWith("http")) {
        imagePath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
      }

      return {
        _id: product._id,

        productId: product.productId,

        name: product.name,

        image: imagePath,

        description: product.customerDescription || "",

        sizes: product.sizes || [],

        selectedSize: sizeData?.size || "",

        acreCoverage: Number(sizeData?.acreCoverage || 1),

        mrp,

        discountPercent: discount,

        finalPrice,

        stockStatus: product.stockStatus || "IN_STOCK",
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("GET CUSTOMER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer products",
    });
  }
});

/* =========================================
   GET ALL PRODUCTS FOR ADMIN
========================================= */

router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("GET ADMIN PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin products",
    });
  }
});

/* =========================================
   SAVE CUSTOMER PRODUCTS
========================================= */

router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Products data is required",
      });
    }

    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        continue;
      }

      /* =========================
           VALIDATE SIZE
        ========================= */

      const validSize = product.sizes?.find(
        (size) => size.size === item.selectedSize,
      );

      product.visibleToCustomers = Boolean(item.selected);

      product.customerDescription = item.description?.trim() || "";

      product.customerDiscountPercent = Math.min(
        Math.max(Number(item.discount || 0), 0),
        100,
      );

      product.customerSelectedSize = validSize
        ? validSize.size
        : product.sizes?.[0]?.size || "";

      await product.save();
    }

    return res.status(200).json({
      success: true,
      message: "Customer products saved successfully",
    });
  } catch (error) {
    console.error("SAVE CUSTOMER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save customer products",
    });
  }
});

export default router;
