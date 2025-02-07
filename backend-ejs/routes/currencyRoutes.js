const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Currency = require("../models/Currency");

// @desc    Get latest currency rates
// @route   GET /api/currency
// @access  Public
router.get("/", async (req, res) => {
  try {
    const currency = await Currency.findOne().sort({ timestamp: -1 });
    res.json(currency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create currency rates
// @route   POST /api/currency
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { usdRate, usdChange, eurRate, eurChange } = req.body;

    const currency = await Currency.create({
      usdRate,
      usdChange,
      eurRate,
      eurChange,
      timestamp: Date.now(),
    });

    res.status(201).json(currency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get currency history
// @route   GET /api/currency/history
// @access  Private
router.get("/history", protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const currencyHistory = await Currency.find({
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    res.json(currencyHistory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
