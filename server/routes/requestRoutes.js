const express = require("express");
const multer = require("multer");
const path = require("path");

const { protect } = require("../middleware/authMiddleware");

const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getWorkerRequests,
  acceptRequest,
  completeRequest,
  sendNotice,
  acceptNotice,
  resolveProblem,
} = require("../controllers/requestController");

const router = express.Router();

// Multer storage for image/video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// Citizen creates request
router.post("/", protect, upload.single("media"), createRequest);

// Citizen sees own requests
router.get("/my", protect, getMyRequests);

// Worker sees requests based on department
router.get("/worker", protect, getWorkerRequests);

// Admin sees all requests
router.get("/", protect, getAllRequests);

// Admin sends notice to worker
router.put("/:id/send-notice", protect, sendNotice);
router.put("/notice/:id", protect, sendNotice);

// Worker accepts request
router.put("/:id/accept", protect, acceptRequest);

// Worker marks request completed
router.put("/:id/complete", protect, completeRequest);

// Worker accepts admin notice
router.put("/:id/accept-notice", protect, acceptNotice);

// Worker resolves notice problem
router.put("/:id/resolve-problem", protect, resolveProblem);

module.exports = router;