import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load .env explicitly
dotenv.config();

/* ==============================
   VALIDATE ENV VARIABLES
============================== */

const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`${key} is missing in .env`);
  }
});

/* ==============================
   CLOUDINARY CONFIGURATION
============================== */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
