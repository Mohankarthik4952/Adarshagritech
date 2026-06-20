import multer from "multer";
import path from "path";
import fs from "fs";

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

createFolder("uploads/products");

createFolder("uploads/profiles");

createFolder("uploads/invoices");

createFolder("uploads/terms");

/* =================================
   STORAGE CONFIGURATION
================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      /* =========================
           DEALER DOCUMENTS
        ========================= */

      if (
        file.fieldname === "gstCertificate" ||
        file.fieldname === "shopPhoto" ||
        file.fieldname === "dealerSelfie"
      ) {
        cb(null, "uploads/documents");
      } else if (
        file.fieldname === "productImage" ||
        file.fieldname === "image" ||
        file.fieldname === "images"
      ) {
        cb(null, "uploads/products");
      } else if (file.fieldname === "profileImage") {
        /* =========================
           PROFILE IMAGES
        ========================= */
        cb(null, "uploads/profiles");
      } else if (file.fieldname === "invoiceFile") {
        /* =========================
           INVOICE FILES
        ========================= */
        cb(null, "uploads/invoices");
      } else if (file.fieldname === "termsFile") {
        /* =========================
           TERMS PDF
        ========================= */
        cb(null, "uploads/terms");
      } else {
        /* =========================
           DEFAULT
        ========================= */
        cb(null, "uploads");
      }
    } catch (error) {
      cb(error);
    }
  },

  filename: (req, file, cb) => {
    try {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + path.extname(file.originalname));
    } catch (error) {
      cb(error);
    }
  },
});

/* =================================
   FILE VALIDATION
================================= */

const fileFilter = (req, file, cb) => {
  try {
    /* IMAGE TYPES */

    const imageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    /* EXCEL TYPES */

    const excelTypes = [
      "application/vnd.ms-excel",

      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    /* PDF TYPES */

    const pdfTypes = ["application/pdf"];

    /* =========================
       IMAGE FILES
    ========================= */

    if (
      file.fieldname === "gstCertificate" ||
      file.fieldname === "shopPhoto" ||
      file.fieldname === "dealerSelfie" ||
      file.fieldname === "productImage" ||
      file.fieldname === "profileImage" ||
      file.fieldname === "image" ||
      file.fieldname === "images"
    ) {
      if (imageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    } else if (file.fieldname === "invoiceFile") {
      /* =========================
       EXCEL FILES
    ========================= */
      if (excelTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only Excel files allowed"));
      }
    } else if (file.fieldname === "termsFile") {
      /* =========================
       PDF FILES
    ========================= */
      if (pdfTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF files are allowed"));
      }
    } else {
      /* =========================
       DEFAULT
    ========================= */
      cb(null, true);
    }
  } catch (error) {
    cb(error);
  }
};

/* =================================
   MULTER INSTANCE
================================= */

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/* =================================
   EXPORTS
================================= */

/* DEALER DOCUMENTS */

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

/* PRODUCT IMAGE */

export const uploadProductImage = (req, res, next) => {
  console.log("uploadProductImage -> next type:", typeof next);

  upload.array("images", 2)(req, res, (error) => {
    if (error) {
      console.error("MULTER ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "File upload failed",
      });
    }

    next();
  });
};

/* PROFILE IMAGE */

export const uploadProfileImage = upload.single("profileImage");

/* INVOICE FILE */

export const uploadInvoiceFile = upload.single("invoiceFile");

/* TERMS FILE */

export const uploadTermsFile = upload.single("termsFile");

/* DEFAULT EXPORT */

export default upload;
