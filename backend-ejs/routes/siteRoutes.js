const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { validateSite } = require("../middleware/validationMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Site = require("../models/Site");
const fs = require("fs").promises;
const path = require("path");

// @desc    Get all sites
// @route   GET /api/sites
// @access  Public
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find({ isActive: true }).sort("order");
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update site order
// @route   PUT /api/sites/reorder
// @access  Private
router.put("/reorder", protect, async (req, res) => {
  try {
    const { siteIds } = req.body;
    if (!Array.isArray(siteIds)) {
      return res.status(400).json({ message: "Geçersiz veri formatı" });
    }

    // Her site için sıra numarasını güncelle
    for (let i = 0; i < siteIds.length; i++) {
      await Site.findByIdAndUpdate(siteIds[i], { order: i });
    }

    const updatedSites = await Site.find({ isActive: true }).sort("order");
    res.json(updatedSites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new site
// @route   POST /api/sites
// @access  Private
router.post(
  "/",
  protect,
  upload.single("logo"),
  validateSite,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Logo yüklemesi zorunludur" });
      }

      const logoPath = `/uploads/${req.file.filename}`;
      const { name, link, order } = req.body;

      const site = await Site.create({
        logo: logoPath,
        name,
        link,
        order: order || 0,
      });

      res.status(201).json(site);
    } catch (error) {
      // Hata durumunda yüklenen dosyayı sil
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Update a site
// @route   PUT /api/sites/:id
// @access  Private
router.put(
  "/:id",
  protect,
  upload.single("logo"),
  validateSite,
  async (req, res) => {
    try {
      const site = await Site.findById(req.params.id);
      if (!site) {
        return res.status(404).json({ message: "Site bulunamadı" });
      }

      // Eğer yeni logo yüklendiyse
      if (req.file) {
        // Eski logoyu sil
        const oldLogoPath = path.join(__dirname, "../public", site.logo);
        await fs.unlink(oldLogoPath).catch(console.error);

        // Yeni logo yolunu kaydet
        site.logo = `/uploads/${req.file.filename}`;
      }

      site.name = req.body.name || site.name;
      site.link = req.body.link || site.link;
      site.order = req.body.order !== undefined ? req.body.order : site.order;
      site.isActive =
        req.body.isActive !== undefined ? req.body.isActive : site.isActive;

      const updatedSite = await site.save();
      res.json(updatedSite);
    } catch (error) {
      // Hata durumunda yüklenen dosyayı sil
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// @desc    Delete a site
// @route   DELETE /api/sites/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: "Site bulunamadı" });
    }

    // Logo dosyasını sil
    const logoPath = path.join(__dirname, "../public", site.logo);
    await fs.unlink(logoPath).catch(console.error);

    await Site.deleteOne({ _id: req.params.id });
    res.json({ message: "Site silindi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
