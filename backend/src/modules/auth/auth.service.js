const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AppConfig } = require("../../config/config");

class AuthService {
  async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plainPassword, salt);
  }

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  generateToken(userId) {
    return jwt.sign({ sub: userId.toString() }, AppConfig.jwtSecret, {
      expiresIn: AppConfig.jwtExpiresIn,
    });
  }

  /**
   * sets the JWT as an httpOnly cookie on the response.
   */
  setTokenCookie(res, token) {
    const isProd = AppConfig.nodeEnv === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearTokenCookie(res) {
    const isProd = AppConfig.nodeEnv === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
  }
}

const authSvc = new AuthService();
module.exports = authSvc;
