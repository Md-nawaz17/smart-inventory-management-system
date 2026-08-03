const path = require("node:path");
const dns = require("node:dns");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const app = require("../app");

let connectionPromise;

const configuredDnsServers = (process.env.DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (configuredDnsServers.length > 0) {
  dns.setServers(configuredDnsServers);
}

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return;

  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Server environment is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
}

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error("Database connection error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to connect to the database",
    });
  }
};
