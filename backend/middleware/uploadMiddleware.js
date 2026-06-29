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
   REQUIRED LOCAL FOLDERS
   (ONLY FOR PDF / EXCEL FILES)
================================= */

createFolder("uploads");
createFolder("uploads/invoices");
createFolder("uploads/terms");

/* =================================
   LOCAL STORAGE
================================= */

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
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
   CLOUDINARY STORAGES
================================= */

const productStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "adarsh/products",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    public_id: `product-${Date.now()}`,
  }),
});

const profileStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "adarsh/profiles",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    public_id: `profile-${Date.now()}`,
  }),
});

const documentStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "adarsh/documents",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    public_id: `document-${Date.now()}`,
  }),
});

const paymentStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "adarsh/payments",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    public_id: `payment-${Date.now()}`,
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
      [
        "gstCertificate",
        "shopPhoto",
        "dealerSelfie",
        "productImage",
        "profileImage",
        "paymentProof",
        "image",
        "images",
      ].includes(file.fieldname)
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

const profileUpload = multer({
  storage: profileStorage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const documentUpload = multer({
  storage: documentStorage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const paymentUpload = multer({
  storage: paymentStorage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* =================================
   DEALER DOCUMENTS
================================= */

export const uploadDealerDocuments = documentUpload.fields([
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
   PRODUCT IMAGES
================================= */

export const uploadProductImage = (req, res, next) => {
  productUpload.array("images", 5)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Product upload failed",
      });
    }

    next();
  });
};

/* =================================
   PROFILE IMAGE
================================= */

export const uploadProfileImage = profileUpload.single("profileImage");

/* =================================
   PAYMENT PROOF
================================= */

export const uploadPaymentProof = paymentUpload.single("paymentProof");

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
