const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Add Product
router.post("/add", async (req, res) => {
  try {
    const {
      productName,
      category,
      quantity,
      price,
      supplier,
    } = req.body;

    // Validation
    if (
      !productName ||
      !category ||
      quantity === "" ||
      price === "" ||
      !supplier
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (quantity < 0 || price < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity and Price cannot be negative",
      });
    }

    const product = new Product({
      productName,
      category,
      quantity,
      price,
      supplier,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product Added Successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Single Product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update Product
router.put("/:id", async (req, res) => {
  try {
    if (
      req.body.quantity < 0 ||
      req.body.price < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity and Price cannot be negative",
      });
    }

    const updatedProduct =
      await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Product Updated Successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete Product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Product Deleted Successfully",
      deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;