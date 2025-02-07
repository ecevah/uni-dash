const rateLimit = require("express-rate-limit");

// Genel API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // IP başına maksimum istek
  message: {
    message:
      "Çok fazla istek gönderildi, lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login için özel rate limit
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // IP başına maksimum 5 başarısız giriş denemesi
  message: {
    message:
      "Çok fazla başarısız giriş denemesi, lütfen 1 saat sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Weather ve Currency API'leri için rate limit
const dataFetchLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 dakika
  max: 50, // IP başına maksimum istek
  message: {
    message:
      "Çok fazla veri çekme isteği, lütfen 30 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  loginLimiter,
  dataFetchLimiter,
};
