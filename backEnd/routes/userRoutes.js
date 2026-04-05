const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  toggleWishlist,
  getAllUsers,
  deleteUser,
  getAdminStats,
  toggleUserRole,
} = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Private routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.put("/wishlist/:productId", protect, toggleWishlist);

// Admin routes
router.get("/admin/stats", protect, isAdmin, getAdminStats);
router.get("/", protect, isAdmin, getAllUsers);
router.put("/:id/role", protect, isAdmin, toggleUserRole);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
