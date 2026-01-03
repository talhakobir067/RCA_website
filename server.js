const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = 3020;

/* ---------- Middleware ---------- */
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ---------- MongoDB Connection ---------- */
mongoose
  .connect("mongodb://127.0.0.1:27017/studentQueries")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ---------- Schema & Model ---------- */
const querySchema = new mongoose.Schema({
  name: { type: String, required: true },
  series: { type: String, required: true },
  roll: { type: String, required: true },
  comments: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Query = mongoose.model("Query", querySchema);

/* ---------- Routes ---------- */

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Query form page
app.get("/query", (req, res) => {
  res.sendFile(path.join(__dirname, "query.html"));
});

// Confirmation page
app.get("/confirmation", (req, res) => {
  res.sendFile(path.join(__dirname, "confirmation.html"));
});

// Handle form submission
app.post("/submit-query", async (req, res) => {
  try {
    const { name, series, roll, comments } = req.body;

    // Basic validation
    if (!name?.trim() || !series?.trim() || !roll?.trim() || !comments?.trim()) {
      console.log("⚠ Incomplete form submission");
      return res.redirect("/query");
    }

    // Save to MongoDB
    const newQuery = new Query({ name, series, roll, comments });
    await newQuery.save();
    console.log("📩 Query saved:", newQuery);

    // Redirect to confirmation page
    res.redirect("/confirmation");
  } catch (error) {
    console.error("🔥 Server Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
