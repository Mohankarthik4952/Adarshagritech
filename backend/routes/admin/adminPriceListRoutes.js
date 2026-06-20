import express from "express";
import multer from "multer";

import PriceList from "../../models/PriceList.js";

const router = express.Router();

/* =================================
   MULTER STORAGE
================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/pricelist");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* =================================
   FILE FILTER
================================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG and JPEG images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

/* =================================
   UPLOAD IMAGE
================================= */

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image",
      });
    }

    const imagePath = `/uploads/pricelist/${req.file.filename}`;

    const priceList = await PriceList.create({
      fileName: req.file.originalname,
      filePath: imagePath,
    });

    res.status(201).json({
      success: true,
      message: "Price list image uploaded successfully",
      priceList,
    });
  } catch (error) {
    console.log("PRICE LIST UPLOAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
});

/* =================================
   GET IMAGES
================================= */

router.get("/", async (req, res) => {
  try {
    const lists = await PriceList.find().sort({
      createdAt: -1,
    });

    res.status(200).json(lists);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch price lists",
    });
  }
});

/* =================================
   DELETE IMAGE
================================= */

router.delete("/:id", async (req, res) => {
  try {
    await PriceList.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Price list deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

export default router;
