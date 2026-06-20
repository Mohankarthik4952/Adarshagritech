import express from "express";

import { uploadTermsFile } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =================================
   UPLOAD TERMS FILE
================================= */

router.post("/upload", uploadTermsFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    res.status(200).json({
      success: true,

      message: "Terms file uploaded successfully",

      file: {
        filename: req.file.filename,

        path: req.file.path,

        mimetype: req.file.mimetype,

        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Terms upload error:", error);

    res.status(500).json({
      success: false,

      message: "Terms upload failed",
    });
  }
});

/* =================================
   GET TERMS
================================= */

router.get("/", async (req, res) => {
  try {
    res.status(200).json({
      success: true,

      terms: [],
    });
  } catch (error) {
    console.error("Fetch terms error:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch terms",
    });
  }
});

export default router;
