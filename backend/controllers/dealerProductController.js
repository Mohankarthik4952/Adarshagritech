import Product from "../../models/Product.js";

export const getDealerProducts = async (req, res) => {
  try {
    const products = await Product.find({
      visibleToDealers: true,
    });

    res.status(200).json(products);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to fetch dealer products",
    });
  }
};
