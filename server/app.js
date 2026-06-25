const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/workers", require("./routes/workerRoutes"));

// User profile routes
app.use("/api/users", require("./routes/userRoutes"));

// Admin analytics and CSV report routes
app.use("/api/admin", require("./routes/adminAnalyticsRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

module.exports = app;