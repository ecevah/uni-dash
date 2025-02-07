const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı header'dan al
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Token'ı cookie'den al (fallback)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Token yoksa veya geçersizse
    if (!token) {
      // API isteği ise JSON yanıt döndür
      if (
        req.xhr ||
        req.headers.accept?.includes("application/json") ||
        req.path.startsWith("/api/")
      ) {
        return res.status(401).json({
          message: "Not authorized",
          code: "TOKEN_REQUIRED",
        });
      }
      // Normal sayfa isteği ise login'e yönlendir
      return res.redirect("/auth/login");
    }

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "abc123");

      // Kullanıcıyı bul
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        if (
          req.xhr ||
          req.headers.accept?.includes("application/json") ||
          req.path.startsWith("/api/")
        ) {
          return res.status(401).json({
            message: "User not found",
            code: "USER_NOT_FOUND",
          });
        }
        return res.redirect("/auth/login");
      }

      // Token'ı cookie olarak da kaydet (güvenlik için httpOnly)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 gün
      });

      req.user = user;
      next();
    } catch (error) {
      // Token geçersiz veya süresi dolmuş
      res.clearCookie("token");

      if (
        req.xhr ||
        req.headers.accept?.includes("application/json") ||
        req.path.startsWith("/api/")
      ) {
        return res.status(401).json({
          message: "Invalid or expired token",
          code: "INVALID_TOKEN",
        });
      }
      return res.redirect("/auth/login");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.clearCookie("token");

    if (
      req.xhr ||
      req.headers.accept?.includes("application/json") ||
      req.path.startsWith("/api/")
    ) {
      return res.status(500).json({
        message: "Server error",
        code: "SERVER_ERROR",
      });
    }
    return res.redirect("/auth/login");
  }
};

module.exports = { protect };
