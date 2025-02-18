const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Check if user is authenticated
// @route   GET /api/users/check-auth
// @access  Private
router.get("/check-auth", protect, (req, res) => {
  res.json({
    isAuthenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      surname: req.user.surname,
      username: req.user.username,
    },
  });
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { name, surname, username, password } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      return;
    }

    const user = await User.create({
      name,
      surname,
      username,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
      });
    } else {
      res.status(400).json({ message: "Geçersiz kullanıcı bilgileri" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.remove();
      res.json({ message: "Kullanıcı silindi" });
    } else {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.surname = req.body.surname || user.surname;
      user.username = req.body.username || user.username;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        surname: updatedUser.surname,
        username: updatedUser.username,
      });
    } else {
      res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
