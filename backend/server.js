const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("node:dns");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const configuredDnsServers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);
const requiredEnv = ["MONGO_URI", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const defaultClientOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const configuredClientOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...defaultClientOrigins,
  ...configuredClientOrigins,
]);

if (missingEnv.length > 0) {
  console.error(`Missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

if (configuredDnsServers.length > 0) {
  dns.setServers(configuredDnsServers);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Inventory Management System API Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

startServer();
