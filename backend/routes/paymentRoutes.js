import express from "express";
import multer from "multer";

const router = express.Router();

/* ===============================
   STORAGE
================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/payments");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

/* ===============================
   FILE FILTER
================================ */

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG and JPEG files are allowed"), false);
  }
};

/* ===============================
   MULTER INSTANCE
================================ */

const upload = multer({
  storage,
  fileFilter,
});

/* ===============================
   UPLOAD PAYMENT SCREENSHOT
================================ */

router.post("/upload", upload.single("paymentProof"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a screenshot",
      });
    }

    res.status(200).json({
      success: true,
      filePath: `/uploads/payments/${req.file.filename}`,
    });
  } catch (error) {
    console.log("PAYMENT UPLOAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
});

/* ===============================
   EXPORT
================================ */

export default router;
