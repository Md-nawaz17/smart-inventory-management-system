const express = require("express");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/", async (req, res) => {
  try {
    const { productId, type, quantity, date, note } = req.body;
    const numericQuantity = Number(quantity);

    if (!productId || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product, type, and quantity are required",
      });
    }

    if (!["stock-in", "stock-out"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Transaction type must be stock-in or stock-out",
      });
    }

    if (!Number.isFinite(numericQuantity) || numericQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (type === "stock-out" && product.quantity < numericQuantity) {
      return res.status(400).json({
        success: false,
        message: "Stock-out quantity cannot exceed current stock",
      });
    }

    product.quantity =
      type === "stock-in"
        ? product.quantity + numericQuantity
        : product.quantity - numericQuantity;

    const transaction = await Transaction.create({
      user: req.user._id,
      product: product._id,
      productName: product.productName,
      type,
      quantity: numericQuantity,
      date: date ? new Date(date) : new Date(),
      note,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Transaction recorded successfully",
      transaction,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("product", "productName category")
      .sort({ date: -1, createdAt: -1 })
      .limit(50);

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
