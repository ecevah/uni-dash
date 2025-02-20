const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Yeni feedback ekleme
router.post("/", async (req, res) => {
  try {
    if (!req.body.type || !["like", "dislike"].includes(req.body.type)) {
      return res.status(400).json({ message: "Geçersiz feedback türü" });
    }

    const feedback = new Feedback({
      type: req.body.type,
      description: req.body.description || "",
    });

    await feedback.save();
    res.status(201).json({
      message: "Geri bildiriminiz başarıyla kaydedildi",
      feedback,
    });
  } catch (error) {
    console.error("Feedback kaydetme hatası:", error);
    res.status(500).json({
      message: "Geri bildirim kaydedilirken bir hata oluştu",
      error: process.env.NODE_ENV === "production" ? null : error.message,
    });
  }
});

// Feedback silme
router.delete("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Geri bildirim bulunamadı",
      });
    }
    res.json({
      success: true,
      message: "Geri bildirim başarıyla silindi",
    });
  } catch (error) {
    console.error("Feedback silme hatası:", error);
    res.status(500).json({
      success: false,
      message: "Geri bildirim silinirken bir hata oluştu",
      error: process.env.NODE_ENV === "production" ? null : error.message,
    });
  }
});

// Tüm feedbackleri getirme
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    const stats = {
      total: feedbacks.length,
      likes: feedbacks.filter((f) => f.type === "like").length,
      dislikes: feedbacks.filter((f) => f.type === "dislike").length,
    };
    res.json({ feedbacks, stats });
  } catch (error) {
    console.error("Feedback listeleme hatası:", error);
    res.status(500).json({
      message: "Geri bildirimler alınırken bir hata oluştu",
      error: process.env.NODE_ENV === "production" ? null : error.message,
    });
  }
});

module.exports = router;
