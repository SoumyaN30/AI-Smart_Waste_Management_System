const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  getWorkerRequests,
  acceptRequest,
  completeRequest,
  acceptNotice,
  resolveProblem,
} = require("../controllers/requestController");

const {
  getWorkerComplaints,
  acceptComplaint,
  completeComplaint,
} = require("../controllers/complaintController");

const User = require("../models/User");

const router = express.Router();

// GET logged-in worker profile
router.get("/profile", protect, async (req, res) => {
  try {
    const worker = await User.findById(req.user.id).select("-password");

    if (!worker) {
      return res.status(404).json({
        msg: "Worker not found",
      });
    }

    res.json(worker);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

// GET all workers - useful for admin
router.get("/", protect, async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(workers);
  } catch (err) {
    res.status(500).json({
      msg: err.message,
    });
  }
});

// WORKER: view department-based service requests
router.get("/requests", protect, getWorkerRequests);

// WORKER: accept service request
router.put("/requests/:id/accept", protect, acceptRequest);

// WORKER: complete service request
router.put("/requests/:id/complete", protect, completeRequest);

// WORKER: accept notice sent by admin for request
router.put("/requests/:id/accept-notice", protect, acceptNotice);

// WORKER: resolve notice problem
router.put("/requests/:id/resolve-problem", protect, resolveProblem);

// WORKER: view complaints sent as notice
router.get("/complaints", protect, getWorkerComplaints);

// WORKER: accept citizen complaint
router.put("/complaints/:id/accept", protect, acceptComplaint);

// WORKER: complete citizen complaint
router.put("/complaints/:id/complete", protect, completeComplaint);

module.exports = router;