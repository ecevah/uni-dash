const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const SpecialDay = require("../models/SpecialDay");
const Site = require("../models/Site");
const Feedback = require("../models/Feedback");

// Admin ana sayfa
router.get("/", async (req, res) => {
  try {
    // İstatistikleri getir
    const stats = {
      announcements: await Announcement.countDocuments(),
      specialDays: await SpecialDay.countDocuments(),
      sites: await Site.countDocuments({ isActive: true }),
    };

    // Son duyuruları getir
    const recentAnnouncements = await Announcement.find()
      .sort({ date: -1 })
      .limit(5);

    // Yaklaşan özel günleri getir
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentDay = String(today.getDate()).padStart(2, "0");
    const currentDate = `${currentDay}-${currentMonth}`;

    const upcomingSpecialDays = await SpecialDay.find({
      date: { $gte: currentDate },
    })
      .sort("date")
      .limit(5);

    // API isteği ise JSON yanıt döndür
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({
        stats,
        recentAnnouncements,
        upcomingSpecialDays,
      });
    }

    // Normal sayfa isteği ise render et
    res.render("admin/index", {
      path: "/admin",
      stats,
      recentAnnouncements,
      upcomingSpecialDays,
    });
  } catch (error) {
    console.error("Admin page error:", error);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(500).render("error", {
      message: "Bir hata oluştu",
      error,
    });
  }
});

// Duyuru yönetimi sayfası
router.get("/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 });

    // API isteği ise JSON yanıt döndür
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ announcements });
    }

    // Normal sayfa isteği ise render et
    res.render("admin/announcements", {
      path: "/admin/announcements",
      announcements,
    });
  } catch (error) {
    console.error("Announcements page error:", error);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(500).render("error", {
      message: "Bir hata oluştu",
      error,
    });
  }
});

// Özel gün yönetimi sayfası
router.get("/special-days", async (req, res) => {
  try {
    const specialDays = await SpecialDay.find().sort("date");

    // API isteği ise JSON yanıt döndür
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ specialDays });
    }

    // Normal sayfa isteği ise render et
    res.render("admin/special-days", {
      path: "/admin/special-days",
      specialDays,
    });
  } catch (error) {
    console.error("Special days page error:", error);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(500).render("error", {
      message: "Bir hata oluştu",
      error,
    });
  }
});

// Site yönetimi sayfası
router.get("/sites", async (req, res) => {
  try {
    const sites = await Site.find().sort("order");

    // API isteği ise JSON yanıt döndür
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ sites });
    }

    // Normal sayfa isteği ise render et
    res.render("admin/sites", {
      path: "/admin/sites",
      sites,
    });
  } catch (error) {
    console.error("Sites page error:", error);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(500).render("error", {
      message: "Bir hata oluştu",
      error,
    });
  }
});

// Geri bildirimleri göster
router.get("/feedbacks", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    const stats = {
      total: feedbacks.length,
      likes: feedbacks.filter((f) => f.type === "like").length,
      dislikes: feedbacks.filter((f) => f.type === "dislike").length,
    };

    // API isteği ise JSON yanıt döndür
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.json({ feedbacks, stats });
    }

    // Normal sayfa isteği ise render et
    res.render("admin/feedbacks", {
      path: "/admin/feedbacks",
      feedbacks,
      stats,
    });
  } catch (error) {
    console.error("Feedbacks page error:", error);
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(500).json({ message: "Server error" });
    }
    res.status(500).render("error", {
      message: "Geri bildirimler yüklenirken bir hata oluştu",
      error,
    });
  }
});

module.exports = router;
