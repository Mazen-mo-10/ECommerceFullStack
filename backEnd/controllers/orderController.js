const Order = require("../models/Order");
const Product = require("../models/Product");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    // Get prices from DB
    const dbItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product ${item.product} not found`);
        if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
          throw new Error("Invalid quantity");
        }
        if (product.stock < item.quantity) {
          throw new Error(`${product.name} is out of stock`);
        }
        return {
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        };
      }),
    );

    // Calculate prices
    const subtotal = dbItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    const shippingPrice = subtotal >= 50 ? 0 : 10;
    const total = subtotal + shippingPrice;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems: dbItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingPrice,
      total,
    });

    // Update stock
    await Promise.all(
      dbItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }),
    );

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1, // latest first
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Make sure the order belongs to the logged in user or admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((acc, o) => acc + o.total, 0);

    res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = Date.now();
      order.paymentStatus = "paid";
      order.paidAt = Date.now();
    }

    await order.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
