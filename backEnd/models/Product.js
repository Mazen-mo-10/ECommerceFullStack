const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    originalPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: [
        "Phones",
        "Computers",
        "SmartWatch",
        "Camera",
        "HeadPhones",
        "Gaming",
      ],
    },
    image: {
      type: String,
      required: [true, "Product image is required"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    isNew: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
