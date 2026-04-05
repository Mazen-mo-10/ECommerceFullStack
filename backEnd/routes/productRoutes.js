const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
} = require("../controllers/productController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/:id", getProductById);

// Private routes
router.post("/:id/reviews", protect, createReview);

// Admin routes
router.post("/", protect, isAdmin, createProduct);
router.put("/:id", protect, isAdmin, updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

module.exports = router;
