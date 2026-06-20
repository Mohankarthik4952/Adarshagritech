import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Dealer from "../models/Dealer.js";

const router = express.Router();

/* =================================
   CREATE UPLOAD FOLDER
================================= */

const uploadDir = "uploads/documents";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* =================================
   STORAGE
================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/* =================================
   UPLOAD DOCUMENTS
================================= */

router.post(
  "/upload",
  upload.fields([
    {
      name: "gstCertificate",
      maxCount: 1,
    },
    {
      name: "shopPhoto",
      maxCount: 1,
    },
    {
      name: "dealerSelfie",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILES:", req.files);

      const { dealerId } = req.body;

      if (!dealerId) {
        return res.status(400).json({
          success: false,
          message: "Dealer ID is required",
        });
      }

      const dealer = await Dealer.findById(dealerId);

      if (!dealer) {
        return res.status(404).json({
          success: false,
          message: "Dealer not found",
        });
      }

      if (req.files?.gstCertificate?.[0]) {
        dealer.gstCertificate = `/uploads/documents/${req.files.gstCertificate[0].filename}`;
      }

      if (req.files?.shopPhoto?.[0]) {
        dealer.shopPhoto = `/uploads/documents/${req.files.shopPhoto[0].filename}`;
      }

      if (req.files?.dealerSelfie?.[0]) {
        dealer.dealerSelfie = `/uploads/documents/${req.files.dealerSelfie[0].filename}`;
      }

      await dealer.save();

      res.status(200).json({
        success: true,
        message: "Documents uploaded successfully",
        dealer,
      });
    } catch (error) {
      console.error("DOCUMENT UPLOAD ERROR:", error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/* =================================
   GET DOCUMENTS
================================= */

router.get("/:dealerId", async (req, res) => {
  try {
    const dealer = await Dealer.findById(req.params.dealerId);

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: "Dealer not found",
      });
    }

    res.status(200).json({
      gstCertificate: dealer.gstCertificate || "",
      shopPhoto: dealer.shopPhoto || "",
      dealerSelfie: dealer.dealerSelfie || "",
    });
  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
