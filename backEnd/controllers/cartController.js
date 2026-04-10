const User = require("../models/User");
const Product = require("../models/Product");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "cart.product",
      "name price image stock",
    );
    res.status(200).json({ success: true, cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// @desc    Save cart
// @route   POST /api/cart
// @access  Private
const saveCart = async (req, res) => {
  try {
    const { items } = req.body;

    const cartItems = items.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    await User.findByIdAndUpdate(req.user._id, { cart: cartItems });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getCart, saveCart, clearCart };
