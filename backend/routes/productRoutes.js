const express = require("express");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

const LOW_STOCK_LIMIT = 10;

const buildProductQuery = (userId, queryParams) => {
  const { search = "", category = "All", status = "All" } = queryParams;
  const query = { user: userId };

  if (search.trim()) {
    query.productName = { $regex: search.trim(), $options: "i" };
  }

  if (category && category !== "All") {
    query.category = category;
  }

  if (status === "in-stock") {
    query.quantity = { $gte: LOW_STOCK_LIMIT };
  }

  if (status === "low-stock") {
    query.quantity = { $gt: 0, $lt: LOW_STOCK_LIMIT };
  }

  if (status === "out-of-stock") {
    query.quantity = 0;
  }

  return query;
};

const getInventorySummary = async (userId) => {
  const summary = await Product.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        lowStockItems: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gt: ["$quantity", 0] },
                  { $lt: ["$quantity", LOW_STOCK_LIMIT] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalInventoryValue: {
          $sum: { $multiply: ["$quantity", "$price"] },
        },
        categories: { $addToSet: "$category" },
      },
    },
  ]);

  const data = summary[0] || {
    totalProducts: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
    categories: [],
  };

  return {
    totalProducts: data.totalProducts,
    lowStockItems: data.lowStockItems,
    totalInventoryValue: data.totalInventoryValue,
    totalCategories: data.categories.length,
  };
};

router.post("/add", async (req, res) => {
  try {
    const { productName, category, quantity, price, supplier } = req.body;

    if (!productName || !category || quantity === "" || price === "" || !supplier) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (Number(quantity) < 0 || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and price cannot be negative",
      });
    }

    const product = await Product.create({
      user: req.user._id,
      productName,
      category,
      quantity: Number(quantity),
      price: Number(price),
      supplier,
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully",
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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;
    const query = buildProductQuery(req.user._id, req.query);

    const [products, totalItems, summary, categories] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
      getInventorySummary(req.user._id),
      Product.distinct("category", { user: req.user._id }),
    ]);

    res.status(200).json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
        totalItems,
        limit,
      },
      summary,
      categories: categories.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/export", async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({
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

router.get("/analytics", async (req, res) => {
  try {
    const user = req.user._id;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [categoryData, movementData] = await Promise.all([
      Product.aggregate([
        { $match: { user } },
        {
          $group: {
            _id: "$category",
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            category: "$_id",
            quantity: 1,
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { user, date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              type: "$type",
            },
            quantity: { $sum: "$quantity" },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),
    ]);

    const movementByDate = new Map();

    for (let i = 0; i < 30; i += 1) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      movementByDate.set(key, {
        date: key,
        stockIn: 0,
        stockOut: 0,
        net: 0,
      });
    }

    movementData.forEach((item) => {
      const entry = movementByDate.get(item._id.date);
      if (!entry) return;

      if (item._id.type === "stock-in") {
        entry.stockIn = item.quantity;
      } else {
        entry.stockOut = item.quantity;
      }

      entry.net = entry.stockIn - entry.stockOut;
    });

    res.status(200).json({
      categoryData,
      movementData: Array.from(movementByDate.values()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
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

router.put("/:id", async (req, res) => {
  try {
    if (Number(req.body.quantity) < 0 || Number(req.body.price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity and price cannot be negative",
      });
    }

    const updates = {
      productName: req.body.productName,
      category: req.body.category,
      quantity: req.body.quantity,
      price: req.body.price,
      supplier: req.body.supplier,
    };

    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Transaction.deleteMany({
      product: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
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
