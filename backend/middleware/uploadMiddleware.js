import multer from "multer";
import path from "path";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary from "../config/cloudinary.js";

/* =================================
   CREATE UPLOAD FOLDERS
================================= */

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  }
};

/* =================================
   REQUIRED FOLDERS
================================= */

createFolder("uploads");
createFolder("uploads/documents");
createFolder("uploads/profiles");
createFolder("uploads/invoices");
createFolder("uploads/terms");

/* =================================
   LOCAL STORAGE
================================= */

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (
        file.fieldname === "gstCertificate" ||
        file.fieldname === "shopPhoto" ||
        file.fieldname === "dealerSelfie"
      ) {
        return cb(null, "uploads/documents");
      }

      if (file.fieldname === "profileImage") {
        return cb(null, "uploads/profiles");
      }

      if (file.fieldname === "invoiceFile") {
        return cb(null, "uploads/invoices");
      }

      if (file.fieldname === "termsFile") {
        return cb(null, "uploads/terms");
      }

      return cb(null, "uploads");
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    try {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      cb(null, uniqueName + path.extname(file.originalname));
    } catch (error) {
      cb(error);
    }
  },
});

/* =================================
   CLOUDINARY STORAGE
================================= */

const productStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "sunrise-products",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

/* =================================
   FILE VALIDATION
================================= */

const fileFilter = (req, file, cb) => {
  try {
    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const excelTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const pdfTypes = ["application/pdf"];

    if (
      file.fieldname === "gstCertificate" ||
      file.fieldname === "shopPhoto" ||
      file.fieldname === "dealerSelfie" ||
      file.fieldname === "productImage" ||
      file.fieldname === "profileImage" ||
      file.fieldname === "image" ||
      file.fieldname === "images"
    ) {
      if (!imageTypes.includes(file.mimetype)) {
        return cb(new Error("Only image files are allowed"));
      }

      return cb(null, true);
    }

    if (file.fieldname === "invoiceFile") {
      if (!excelTypes.includes(file.mimetype)) {
        return cb(new Error("Only Excel files allowed"));
      }

      return cb(null, true);
    }

    if (file.fieldname === "termsFile") {
      if (!pdfTypes.includes(file.mimetype)) {
        return cb(new Error("Only PDF files are allowed"));
      }

      return cb(null, true);
    }

    cb(null, true);
  } catch (error) {
    cb(error);
  }
};

/* =================================
   MULTER INSTANCES
================================= */

const upload = multer({
  storage: localStorage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const productUpload = multer({
  storage: productStorage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* =================================
   DEALER DOCUMENTS
================================= */

export const uploadDealerDocuments = upload.fields([
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
]);

/* =================================
   PRODUCT IMAGES (CLOUDINARY)
================================= */

export const uploadProductImage = (req, res, next) => {
  productUpload.array("images", 5)(req, res, (error) => {
    if (error) {
      console.error("PRODUCT UPLOAD ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "File upload failed",
      });
    }

    next();
  });
};

/* =================================
   PROFILE IMAGE
================================= */

export const uploadProfileImage = upload.single("profileImage");

/* =================================
   INVOICE FILE
================================= */

export const uploadInvoiceFile = upload.single("invoiceFile");

/* =================================
   TERMS FILE
================================= */

export const uploadTermsFile = upload.single("termsFile");

/* =================================
   DEFAULT EXPORT
================================= */

export default upload;
