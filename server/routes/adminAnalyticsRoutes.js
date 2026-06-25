const express = require("express");
const Request = require("../models/Request");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const wasteCategories = [
  "Household Garbage Pickup",
  "Clean Roadside Fallen Leaves",
  "Public Washroom Cleaning",
  "Choked Drain",
  "Area Garbage Pickup",
  "Gutter Overflow",
  "Other",
];

const getDateKey = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

router.get("/analytics", protect, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("citizen", "name fullName email phone address landmark")
      .populate("acceptedBy", "name fullName email department")
      .sort({ createdAt: -1 });

    const complaints = await Complaint.find()
      .populate("user", "name fullName email phone address landmark role")
      .populate("acceptedBy", "name fullName email department")
      .populate("completedBy", "name fullName email department")
      .sort({ createdAt: -1 });

    const users = await User.find().select("-password");

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === "pending").length;
    const acceptedRequests = requests.filter((r) => r.status === "accepted").length;
    const completedRequests = requests.filter((r) => r.status === "completed").length;

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter((c) => c.status === "pending").length;
    const acceptedComplaints = complaints.filter((c) => c.status === "accepted").length;
    const completedComplaints = complaints.filter((c) => c.status === "completed").length;

    const totalCitizens = users.filter((u) => u.role === "citizen").length;
    const totalWorkers = users.filter((u) => u.role === "worker").length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;

    const requestStatusStats = [
      { _id: "Pending", count: pendingRequests },
      { _id: "Accepted", count: acceptedRequests },
      { _id: "Completed", count: completedRequests },
    ];

    const wasteCategories = [
      "Household Garbage Pickup",
      "Clean Roadside Fallen Leaves",
      "Public Washroom Cleaning",
      "Choked Drain",
      "Area Garbage Pickup",
      "Gutter Overflow",
      "Other",
    ];

    const wasteTypeStats = wasteCategories.map((category) => ({
      _id: category,
      count: requests.filter(
        (r) => r.category === category && r.status === "completed"
      ).length,
    }));

    const dailyMap = {};

    requests.forEach((r) => {
      const date = new Date(r.createdAt).toISOString().split("T")[0];

      if (!dailyMap[date]) {
        dailyMap[date] = {
          _id: date,
          date,
          requests: 0,
        };
      }

      dailyMap[date].requests += 1;
    });

    const dailyRequestTrend = Object.values(dailyMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // AREA-WISE REQUEST COUNT
    const areaMap = {};

    requests.forEach((r) => {
      const rawArea =
        r.area ||
        r.location?.address ||
        r.citizen?.address ||
        "Unknown Area";

      const cleanArea = String(rawArea).trim().replace(/\s+/g, " ");
      const areaKey = cleanArea.toLowerCase();

      if (!areaMap[areaKey]) {
        areaMap[areaKey] = {
          _id: cleanArea,
          name: cleanArea,
          area: cleanArea,
          count: 0,
          value: 0,
        };
      }

      areaMap[areaKey].count += 1;
      areaMap[areaKey].value += 1;
    });

    const areaStats = Object.values(areaMap).sort((a, b) => b.count - a.count);

    res.json({
      summary: {
        totalRequests,
        pendingRequests,
        acceptedRequests,
        completedRequests,
        totalComplaints,
        pendingComplaints,
        acceptedComplaints,
        completedComplaints,
        resolvedComplaints: completedComplaints,
        totalCitizens,
        totalWorkers,
        totalAdmins,
      },

      charts: {
        requestStatusStats,
        wasteTypeStats,
        dailyRequestTrend,
        areaStats,
      },

      // Extra frontend-compatible names
      totalRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,

      totalComplaints,
      pendingComplaints,
      acceptedComplaints,
      completedComplaints,

      requestStatusData: requestStatusStats.map((item) => ({
        name: item._id,
        count: item.count,
      })),

      wasteTypeData: wasteTypeStats.map((item) => ({
        name: item._id,
        count: item.count,
      })),

      dailyTrendData: dailyRequestTrend,

      areaWiseData: areaStats.map((item) => ({
        name: item.name,
        area: item.area,
        count: item.count,
      })),

      recentRequests: requests.slice(0, 5),
      recentComplaints: complaints.slice(0, 5),
    });
  } catch (err) {
    console.error("Admin Analytics Error:", err);
    res.status(500).json({
      msg: err.message,
      message: err.message,
    });
  }
});

router.get("/csv-report", protect, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("citizen", "name fullName email")
      .sort({ createdAt: -1 });

    const complaints = await Complaint.find()
      .populate("user", "name fullName email")
      .sort({ createdAt: -1 });

    const rows = [];

    rows.push([
      "Type",
      "Category",
      "Area",
      "Description/Message",
      "Status",
      "User Name",
      "User Email",
      "Created At",
    ]);

    requests.forEach((r) => {
      rows.push([
        "Request",
        r.category || "",
        r.area || "",
        r.description || "",
        r.status || "",
        r.citizen?.fullName || r.citizen?.name || "",
        r.citizen?.email || "",
        r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      ]);
    });

    complaints.forEach((c) => {
      rows.push([
        "Complaint",
        "Complaint",
        "",
        c.message || "",
        c.status || "",
        c.user?.fullName || c.user?.name || "",
        c.user?.email || "",
        c.createdAt ? new Date(c.createdAt).toLocaleString() : "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment("smart-waste-report.csv");
    res.send(csv);
  } catch (err) {
    console.error("CSV Report Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
});

module.exports = router;