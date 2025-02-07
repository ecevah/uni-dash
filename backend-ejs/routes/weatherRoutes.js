const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Weather = require("../models/Weather");

// @desc    Get latest weather data
// @route   GET /api/weather
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const weather = await Weather.findOne().sort({ timestamp: -1 });

    // API isteği için JSON yanıt
    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.path.startsWith("/api/")
    ) {
      return res.json(weather);
    }

    // EJS için sayfa render
    res.render("weather", {
      weather,
      user: req.user,
      title: "Hava Durumu",
    });
  } catch (error) {
    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.path.startsWith("/api/")
    ) {
      return res.status(500).json({ message: error.message });
    }
    res.render("error", {
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error : {},
      user: req.user,
    });
  }
});

// @desc    Create weather data
// @route   POST /api/weather
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { temperature, condition, icon, location } = req.body;

    const weather = await Weather.create({
      temperature,
      condition,
      icon,
      location: location || "İzmir",
      timestamp: Date.now(),
    });

    res.status(201).json(weather);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get weather history
// @route   GET /api/weather/history
// @access  Private
router.get("/history", protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const weatherHistory = await Weather.find({
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    // API isteği için JSON yanıt
    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.path.startsWith("/api/")
    ) {
      return res.json(weatherHistory);
    }

    // EJS için sayfa render
    res.render("weather-history", {
      weatherHistory,
      days,
      user: req.user,
      title: "Hava Durumu Geçmişi",
    });
  } catch (error) {
    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.path.startsWith("/api/")
    ) {
      return res.status(500).json({ message: error.message });
    }
    res.render("error", {
      message: error.message,
      error: process.env.NODE_ENV === "development" ? error : {},
      user: req.user,
    });
  }
});

module.exports = router;
