const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const passport = require("./config/passport");
const cartRoutes = require("./routes/cartRoutes");

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rate Limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

// Connect DB and start server
const PORT_NUM = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT_NUM, () => {
    console.log(`Server running on port ${PORT_NUM}`);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Server Error" });
});
