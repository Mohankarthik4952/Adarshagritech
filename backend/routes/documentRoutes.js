import express from "express";
import Dealer from "../models/Dealer.js";

import { uploadDealerDocuments } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =================================
   UPLOAD DOCUMENTS
================================= */

router.post("/upload", uploadDealerDocuments, async (req, res) => {
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
      dealer.gstCertificate = req.files.gstCertificate[0].path;
    }

    if (req.files?.shopPhoto?.[0]) {
      dealer.shopPhoto = req.files.shopPhoto[0].path;
    }

    if (req.files?.dealerSelfie?.[0]) {
      dealer.dealerSelfie = req.files.dealerSelfie[0].path;
    }

    await dealer.save();

    return res.status(200).json({
      success: true,
      message: "Documents uploaded successfully",
      dealer,
    });
  } catch (error) {
    console.error("DOCUMENT UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload documents",
    });
  }
});

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

    return res.status(200).json({
      success: true,

      gstCertificate: dealer.gstCertificate || "",
      shopPhoto: dealer.shopPhoto || "",
      dealerSelfie: dealer.dealerSelfie || "",
    });
  } catch (error) {
    console.error("GET DOCUMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch documents",
    });
  }
});

export default router;
