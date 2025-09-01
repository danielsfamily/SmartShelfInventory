// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      trim: true,
      default: "Uncategorized",
      maxlength: 120,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Stock must be an integer",
      },
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
      // store as number of currency units (e.g., 12.99). If you need high precision money, use cents as integer.
    },
  },
  { timestamps: true }
);

// Useful compound index for quick lookup by name within a category
ProductSchema.index({ category: 1, name: 1 }, { unique: false });

module.exports = mongoose.model("Product", ProductSchema);
