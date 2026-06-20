import express from "express";
import Product from "../../models/Product.js";
import { uploadProductImage } from "../../middleware/uploadMiddleware.js";

const router = express.Router();

/* =================================
   ADD PRODUCT
================================= */

router.post("/products", uploadProductImage, async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const { productId, name, stockStatus } = req.body;

    let parsedSizes = [];

    try {
      parsedSizes =
        typeof req.body.sizes === "string"
          ? JSON.parse(req.body.sizes)
          : req.body.sizes || [];
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid sizes format",
      });
    }

    if (!productId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one size is required",
      });
    }

    const existing = await Product.findOne({
      productId: productId.trim(),
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product ID already exists",
      });
    }

    const product = await Product.create({
      productId: productId.trim(),

      name: name.trim(),

      images: req.files.map((file) => `/uploads/products/${file.filename}`),

      stockStatus: stockStatus || "AVAILABLE",

      sizes: parsedSizes,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product",
    });
  }
});

/* =================================
   GET PRODUCTS
================================= */

router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
});

/* =================================
   UPDATE PRODUCT
================================= */

router.put("/products/:id", uploadProductImage, async (req, res) => {
  try {
    const { productId, name, stockStatus } = req.body;

    let parsedSizes = [];

    try {
      parsedSizes =
        typeof req.body.sizes === "string"
          ? JSON.parse(req.body.sizes)
          : req.body.sizes || [];
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid sizes format",
      });
    }

    const updateData = {
      productId: productId?.trim(),

      name: name?.trim(),

      stockStatus,

      sizes: parsedSizes,
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
});

/* =================================
   DELETE PRODUCT
================================= */

router.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
});

/* =================================
   SAVE DEALER PRODUCTS
================================= */

router.post("/dealer-products", async (req, res) => {
  try {
    const { products } = req.body;

    console.log("RECEIVED PRODUCTS:", JSON.stringify(products, null, 2));

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Products data required",
      });
    }

    for (const item of products) {
      if (
        item.selected &&
        (!item.description || item.description.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Product description is required",
        });
      }

      if (
        item.selected &&
        (item.discount === undefined ||
          item.discount === null ||
          item.discount === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Discount is required",
        });
      }

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

      console.log("UPDATING STOCK:", product.name, stockQuantity);

      if (Array.isArray(product.sizes)) {
        product.sizes.forEach((size) => {
          size.stockQuantity = stockQuantity;
        });

        product.markModified("sizes");
      }

      await product.save();

      const updatedProduct = await Product.findById(item.productId).lean();

      console.log(
        "UPDATED SIZES:",
        updatedProduct.sizes.map((size) => ({
          size: size.size,
          stockQuantity: size.stockQuantity,
        })),
      );
    }

    return res.status(200).json({
      success: true,
      message: "Dealer products saved successfully",
    });
  } catch (error) {
    console.error("SAVE DEALER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save dealer products",
    });
  }
});

/* =================================
   SAVE CUSTOMER PRODUCTS
================================= */

router.post("/customer-products", async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: "Products data required",
      });
    }

    for (const item of products) {
      if (
        item.selected &&
        (!item.description || item.description.trim() === "")
      ) {
        return res.status(400).json({
          success: false,
          message: "Product description is required",
        });
      }

      await Product.findByIdAndUpdate(item.productId, {
        visibleToCustomers: item.selected,
        customerDescription: item.description,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer products saved successfully",
    });
  } catch (error) {
    console.error("SAVE CUSTOMER PRODUCTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save customer products",
    });
  }
});

export default router;
