const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const cron = require("node-cron");
const connectDB = require("./config/db");

// Rate limit middleware
const {
  apiLimiter,
  loginLimiter,
  dataFetchLimiter,
} = require("./middleware/rateLimitMiddleware");

// Service imports
const { fetchWeatherData } = require("./services/weatherService");
const { fetchCurrencyData } = require("./services/currencyService");

// Route imports
const userRoutes = require("./routes/userRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const siteRoutes = require("./routes/siteRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const specialDayRoutes = require("./routes/specialDayRoutes");
const { router: authRoutes } = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Model imports
const Announcement = require("./models/Announcement");
const Currency = require("./models/Currency");
const Weather = require("./models/Weather");
const Site = require("./models/Site");
const SpecialDay = require("./models/SpecialDay");

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Connect to MongoDB
connectDB();

// Schedule cron jobs
// Her yarım saatte bir çalışacak (*/30 * * * *)
cron.schedule("*/30 * * * *", async () => {
  console.log("Fetching weather and currency data...");
  try {
    await Promise.all([fetchWeatherData(), fetchCurrencyData()]);
    console.log("Data fetch completed successfully");
  } catch (error) {
    console.error("Error in cron job:", error.message);
  }
});

// İlk veri çekme işlemini hemen başlat
(async () => {
  try {
    await Promise.all([fetchWeatherData(), fetchCurrencyData()]);
    console.log("Initial data fetch completed successfully");
  } catch (error) {
    console.error("Error in initial data fetch:", error.message);
  }
})();

// Middleware
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Apply rate limiting
app.use("/api/", apiLimiter); // Genel API rate limit
app.use("/api/users/login", loginLimiter); // Login için özel rate limit
app.use(["/api/weather", "/api/currency"], dataFetchLimiter); // Veri çekme için rate limit

// Web routes
app.get("/", (req, res) => res.redirect("/auth/login"));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// Public dashboard data endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    // Son 3 duyuru - tarihe ve oluşturulma zamanına göre sıralı
    const announcements = await Announcement.find()
      .sort({ date: -1, createdAt: -1 })
      .limit(3);

    // Son döviz kuru
    const currency = await Currency.findOne().sort({ timestamp: -1 });

    // Son hava durumu
    const weather = await Weather.findOne().sort({ timestamp: -1 });

    // Aktif siteler
    const sites = await Site.find({ isActive: true }).sort("order");

    // Bugünkü özel gün
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentDay = String(today.getDate()).padStart(2, "0");
    const currentDate = `${currentDay}-${currentMonth}`;
    const specialDay = await SpecialDay.findOne({ date: currentDate });

    res.json({
      announcements,
      currency,
      weather,
      sites,
      specialDay,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/currency", currencyRoutes);
app.use("/api/special-days", specialDayRoutes);

// Error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // API hata yanıtı
  if (req.path.startsWith("/api/")) {
    return res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  }

  // Web sayfası hata yanıtı
  res.status(statusCode);
  res.render("error", {
    message: err.message,
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

module.exports = app;
