const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Private routes
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/admin/all", protect, isAdmin, getAllOrders);
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;
