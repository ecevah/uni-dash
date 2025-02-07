const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const SpecialDay = require("../models/SpecialDay");

// @desc    Get all special days
// @route   GET /api/special-days
// @access  Public
router.get("/", async (req, res) => {
  try {
    const specialDays = await SpecialDay.find({}).sort("date");
    res.json(specialDays);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a special day
// @route   POST /api/special-days
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { date, name, icon, color } = req.body;
    const specialDay = await SpecialDay.create({
      date,
      name,
      icon,
      color,
    });
    res.status(201).json(specialDay);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a special day
// @route   PUT /api/special-days/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const specialDay = await SpecialDay.findById(req.params.id);
    if (!specialDay) {
      return res.status(404).json({ message: "Özel gün bulunamadı" });
    }

    specialDay.date = req.body.date || specialDay.date;
    specialDay.name = req.body.name || specialDay.name;
    specialDay.icon = req.body.icon || specialDay.icon;
    specialDay.color = req.body.color || specialDay.color;

    const updatedSpecialDay = await specialDay.save();
    res.json(updatedSpecialDay);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a special day
// @route   DELETE /api/special-days/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const specialDay = await SpecialDay.findById(req.params.id);
    if (specialDay) {
      await SpecialDay.deleteOne({ _id: req.params.id });
      res.json({ message: "Özel gün silindi" });
    } else {
      res.status(404).json({ message: "Özel gün bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
