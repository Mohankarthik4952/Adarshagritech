router.get("/recommended/:crop", async (req, res) => {
  try {
    const crop = req.params.crop;

    const products = await Product.find({
      recommendedCrops: crop,
      visibleToCustomer: true,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});
