const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  generateToken,
  sendTokenCookie,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    sendTokenCookie(res, token);
    res.redirect(`${process.env.CLIENT_URL}/`);
  },
);

module.exports = router;
