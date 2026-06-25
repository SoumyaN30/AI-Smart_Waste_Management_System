const { Parser } = require("json2csv");
const getDateRange = require("../utils/dateRange");

const Request = require("../models/Request");
const Complaint = require("../models/Complaint");

exports.getAdminAnalytics = async (req, res) => {
  try {
    const { range = "month", startDate, endDate } = req.query;
    const { start, end } = getDateRange(range, startDate, endDate);

    const dateFilter = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const totalRequests = await Request.countDocuments(dateFilter);

    const completedRequests = await Request.countDocuments({
      ...dateFilter,
      status: "completed",
    });

    const pendingRequests = await Request.countDocuments({
      ...dateFilter,
      status: "pending",
    });

    const acceptedRequests = await Request.countDocuments({
      ...dateFilter,
      status: "accepted",
    });

    const totalComplaints = await Complaint.countDocuments(dateFilter);

    const resolvedComplaints = await Complaint.countDocuments({
      ...dateFilter,
      status: "resolved",
    });

    const requestStatusStats = await Request.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const wasteCategories = [
  "Household Garbage Pickup",
  "Clean Roadside Fallen Leaves",
  "Public Washroom Cleaning",
  "Choked Drain",
  "Area Garbage Pickup",
  "Gutter Overflow",
  "Other",
];

const collectedWasteStatsRaw = await Request.aggregate([
  {
    $match: {
      ...dateFilter,
      status: "completed",
    },
  },
  {
    $group: {
      _id: "$category",
      count: { $sum: 1 },
    },
  },
]);

const wasteTypeStats = wasteCategories.map((category) => {
  const found = collectedWasteStatsRaw.find((item) => item._id === category);

  return {
    _id: category,
    count: found ? found.count : 0,
  };
});
    const areaStats = await Request.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$area",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dailyRequestTrend = await Request.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      range,
      start,
      end,
      summary: {
        totalRequests,
        completedRequests,
        pendingRequests,
        acceptedRequests,
        totalComplaints,
        resolvedComplaints,
      },
      charts: {
        requestStatusStats,
        wasteTypeStats,
        areaStats,
        dailyRequestTrend,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

exports.downloadCSVReport = async (req, res) => {
  try {
    const { range = "month", startDate, endDate } = req.query;
    const { start, end } = getDateRange(range, startDate, endDate);

    const dateFilter = {
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const requests = await Request.find(dateFilter)
      .populate("citizen", "name email")
      .populate("worker", "name email")
      .lean();

    const complaints = await Complaint.find(dateFilter)
      .populate("citizen", "name email")
      .lean();

    const reportRows = [];

    requests.forEach((request) => {
      reportRows.push({
        type: "Pickup Request",
        id: request._id,
        citizenName: request.citizen?.name || "N/A",
        citizenEmail: request.citizen?.email || "N/A",
        workerName: request.worker?.name || "Not Assigned",
        wasteType: request.wasteType || "N/A",
        area: request.area || request.location || "N/A",
        status: request.status || "N/A",
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      });
    });

    complaints.forEach((complaint) => {
      reportRows.push({
        type: "Complaint",
        id: complaint._id,
        citizenName: complaint.citizen?.name || "N/A",
        citizenEmail: complaint.citizen?.email || "N/A",
        workerName: "N/A",
        wasteType: "N/A",
        area: complaint.area || complaint.location || "N/A",
        status: complaint.status || "N/A",
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
      });
    });

    const fields = [
      "type",
      "id",
      "citizenName",
      "citizenEmail",
      "workerName",
      "wasteType",
      "area",
      "status",
      "createdAt",
      "updatedAt",
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(reportRows);

    res.header("Content-Type", "text/csv");
    res.attachment(`smart-waste-report-${range}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("CSV report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate CSV report",
    });
  }
};