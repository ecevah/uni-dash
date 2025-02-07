const { body, validationResult } = require("express-validator");

// Validation sonuçlarını kontrol et
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Kullanıcı validasyonları
const validateUser = [
  body("name").trim().notEmpty().withMessage("İsim alanı zorunludur"),
  body("surname").trim().notEmpty().withMessage("Soyisim alanı zorunludur"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Kullanıcı adı zorunludur")
    .isLength({ min: 3 })
    .withMessage("Kullanıcı adı en az 3 karakter olmalıdır"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Şifre zorunludur")
    .isLength({ min: 6 })
    .withMessage("Şifre en az 6 karakter olmalıdır"),
  validateRequest,
];

// Login validasyonları
const validateLogin = [
  body("username").trim().notEmpty().withMessage("Kullanıcı adı zorunludur"),
  body("password").trim().notEmpty().withMessage("Şifre zorunludur"),
  validateRequest,
];

// Duyuru validasyonları
const validateAnnouncement = [
  body("content").trim().notEmpty().withMessage("Duyuru içeriği zorunludur"),
  body("priority")
    .optional()
    .isBoolean()
    .withMessage("Öncelik değeri geçersiz"),
  body("date").optional().isISO8601().withMessage("Geçersiz tarih formatı"),
  validateRequest,
];

// Site validasyonları
const validateSite = [
  body("name").trim().notEmpty().withMessage("Site adı zorunludur"),
  body("link")
    .trim()
    .notEmpty()
    .withMessage("Site linki zorunludur")
    .isURL()
    .withMessage("Geçerli bir URL giriniz"),
  body("order").optional().isInt().withMessage("Sıralama değeri geçersiz"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Aktiflik değeri geçersiz"),
  validateRequest,
];

// Hava durumu validasyonları
const validateWeather = [
  body("temperature").isNumeric().withMessage("Sıcaklık değeri geçersiz"),
  body("condition")
    .trim()
    .notEmpty()
    .withMessage("Hava durumu açıklaması zorunludur"),
  body("icon").trim().notEmpty().withMessage("Hava durumu ikonu zorunludur"),
  validateRequest,
];

// Döviz kuru validasyonları
const validateCurrency = [
  body("usdRate").isNumeric().withMessage("USD kuru geçersiz"),
  body("usdChange").isNumeric().withMessage("USD değişim oranı geçersiz"),
  body("eurRate").isNumeric().withMessage("EUR kuru geçersiz"),
  body("eurChange").isNumeric().withMessage("EUR değişim oranı geçersiz"),
  validateRequest,
];

module.exports = {
  validateUser,
  validateLogin,
  validateAnnouncement,
  validateSite,
  validateWeather,
  validateCurrency,
};
