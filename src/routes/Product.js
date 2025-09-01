// routes/products.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Helper: async route wrapper
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * GET /api/products
 * Query params (optional):
 *  - q (search in name & category)
 *  - category
 *  - minStock, maxStock
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, minStock, maxStock } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (minStock) filter.stock = { ...(filter.stock || {}), $gte: Number(minStock) };
    if (maxStock) filter.stock = { ...(filter.stock || {}), $lte: Number(maxStock) };

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    res.json(products);
  })
);

/**
 * GET /api/products/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Product.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  })
);

/**
 * POST /api/products
 * body: { name, category?, stock?, price? }
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, category, stock, price } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const doc = await Product.create({
      name: name.trim(),
      category: typeof category === "string" ? category.trim() : undefined,
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : undefined,
      price: Number.isFinite(price) ? Math.max(0, Number(price)) : undefined,
    });
    res.status(201).json(doc);
  })
);

/**
 * PUT /api/products/:id
 * Replace full resource
 */
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, category, stock, price } = req.body || {};
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const payload = {
      name: name.trim(),
      category: typeof category === "string" ? category.trim() : "Uncategorized",
      stock: Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : 0,
      price: Number.isFinite(price) ? Math.max(0, Number(price)) : 0,
    };
    const updated = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
      overwrite: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  })
);

/**
 * PATCH /api/products/:id
 * Partial update
 */
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const patch = {};
    if ("name" in req.body) patch.name = String(req.body.name || "").trim();
    if ("category" in req.body) patch.category = String(req.body.category || "").trim();
    if ("stock" in req.body) {
      const s = Number(req.body.stock);
      if (!Number.isFinite(s) || Math.floor(s) < 0) return res.status(400).json({ error: "Invalid stock" });
      patch.stock = Math.floor(s);
    }
    if ("price" in req.body) {
      const p = Number(req.body.price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: "Invalid price" });
      patch.price = p;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  })
);

/**
 * PATCH /api/products/:id/stock
 * body: { delta }  (e.g., { "delta": 5 } or { "delta": -2 })
 */
router.patch(
  "/:id/stock",
  asyncHandler(async (req, res) => {
    const delta = Number(req.body?.delta);
    if (!Number.isFinite(delta)) return res.status(400).json({ error: "delta must be a number" });

    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id },
      [
        {
          $set: {
            stock: {
              $max: [0, { $add: ["$stock", Math.trunc(delta)] }],
            },
          },
        },
      ],
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  })
);

/**
 * DELETE /api/products/:id
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  })
);

module.exports = router;

/*
Usage in your main server file (example):
----------------------------------------
const express = require('express');
const mongoose = require('mongoose');
const productsRouter = require('./routes/products');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API
app.use('/api/products', productsRouter);

// Static HTML for "/"
app.use(express.static(path.join(__dirname, 'public')));

// Connect & start
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1/inventory');
app.listen(process.env.PORT || 3000, () => console.log('http://localhost:3000'));
*/
