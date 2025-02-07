const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Announcement = require("../models/Announcement");

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Public
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ date: -1 })
      .populate("createdBy", "name surname");
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { content, priority, date } = req.body;

    const announcement = await Announcement.create({
      content,
      priority,
      date: date || Date.now(),
      createdBy: req.user._id,
    });

    const populatedAnnouncement = await announcement.populate(
      "createdBy",
      "name surname"
    );
    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update an announcement
// @route   PUT /api/announcements/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (announcement) {
      announcement.content = req.body.content || announcement.content;
      announcement.priority =
        req.body.priority !== undefined
          ? req.body.priority
          : announcement.priority;
      announcement.date = req.body.date || announcement.date;

      const updatedAnnouncement = await announcement.save();
      const populatedAnnouncement = await updatedAnnouncement.populate(
        "createdBy",
        "name surname"
      );
      res.json(populatedAnnouncement);
    } else {
      res.status(404).json({ message: "Duyuru bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (announcement) {
      await Announcement.deleteOne({ _id: req.params.id });
      res.json({ message: "Duyuru silindi" });
    } else {
      res.status(404).json({ message: "Duyuru bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
