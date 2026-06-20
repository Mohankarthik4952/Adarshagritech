import express from "express";
import SocialLinks from "../models/SocialLinks.js";

const router = express.Router();

// 👉 GET LINKS (Dealer/Customer use this)
router.get("/", async (req, res) => {
  const data = await SocialLinks.findOne();
  res.json(data);
});

// 👉 CREATE or UPDATE (Admin)
router.post("/save", async (req, res) => {
  const { whatsapp, youtube, instagram } = req.body;

  let existing = await SocialLinks.findOne();

  if (existing) {
    existing.whatsapp = whatsapp;
    existing.youtube = youtube;
    existing.instagram = instagram;

    await existing.save();

    return res.json({ message: "Updated successfully", data: existing });
  }

  const newData = await SocialLinks.create({
    whatsapp,
    youtube,
    instagram,
  });

  res.json({ message: "Saved successfully", data: newData });
});

export default router;
