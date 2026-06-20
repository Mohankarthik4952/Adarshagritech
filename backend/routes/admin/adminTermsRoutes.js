router.post("/upload", upload.single("termsFile"), async (req, res) => {
  const { role } = req.body;

  // find existing
  const existing = await Terms.findOne({ role });

  let version = 1;

  if (existing) {
    version = existing.version + 1;

    await Terms.findByIdAndDelete(existing._id);
  }

  const newDoc = await Terms.create({
    fileName: req.file.originalname,
    filePath: `/uploads/documents/${req.file.filename}`,
    role,
    version,
  });

  res.json({ success: true, newDoc });
});
