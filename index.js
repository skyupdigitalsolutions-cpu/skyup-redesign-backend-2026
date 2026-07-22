const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { connectToDatabase } = require("./config/db");

const contactRoute = require("./routes/contact.route");
const authRoutes = require("./routes/authRoutes");
const receiptRoutes = require("./routes/receiptRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("SkyUp Contact Backend is running");
});

// ============================================
// ENSURE NATIVE MONGO DRIVER IS CONNECTED
// (receiptController uses the native driver via getDb(),
// separate from mongoose which handles contact.model.js)
// ============================================
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("❌ connectToDatabase() failed:", err); // <-- add this
    res.status(503).json({ message: "Database temporarily unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/", receiptRoutes);
app.use("/api/contacts", contactRoute);

// MongoDB connection (mongoose — used by contact.model.js)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port number ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Connection failed");
  });