import Product from "../../models/Product.js";

/* =========================
   ADD PRODUCT
========================= */

export const addProduct = async (req, res) => {
  try {
    const { productId, name, stockStatus, sizes } = req.body;

    /* IMAGE */

    const image = req.file ? `/uploads/${req.file.filename}` : "";

    /* VALIDATION */

    if (!productId || !name || !image) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* CHECK PRODUCT */

    const exists = await Product.findOne({
      productId,
    });

    if (exists) {
      return res.status(400).json({
        message: "Product ID already exists",
      });
    }

    /* CREATE PRODUCT */

    const product = await Product.create({
      productId,
      name,
      image,
      stockStatus,
      sizes: JSON.parse(sizes),
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Failed to add product",
    });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
};

export const updateDealerVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    const { visibleToDealers, dealerDiscountPercent, dealerDescription } =
      req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // SAVE VISIBILITY

    product.visibleToDealers = visibleToDealers;

    // SAVE DISCOUNT

    product.discountPercent = dealerDiscountPercent || 0;

    // SAVE DESCRIPTION

    product.description = dealerDescription || "";

    await product.save();

    res.status(200).json({
      success: true,
      message: "Dealer product updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};
