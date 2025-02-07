const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Login sayfasını göster
router.get("/login", (req, res) => {
  res.render("login");
});

// Login işlemi
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Geçersiz kullanıcı adı veya şifre",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Token oluştur
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "abc123",
      { expiresIn: "1d" }
    );

    // Başarılı yanıt
    res.json({
      _id: user._id,
      name: user.name,
      surname: user.surname,
      username: user.username,
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Sunucu hatası",
      code: "SERVER_ERROR",
    });
  }
});

module.exports = { router };
