import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/reviews", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          key: process.env.YOUTUBE_API_KEY,
          channelId: process.env.YOUTUBE_CHANNEL_ID,
          part: "snippet",
          order: "date",
          maxResults: 6,
          type: "video",
        },
      },
    );

    const videos = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
    }));

    return res.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("YOUTUBE API ERROR:", error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Failed to load videos",
    });
  }
});

export default router;
