const express = require("express");
const multer = require("multer");
const path = require("path");

const { protect } = require("../middleware/authMiddleware");

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getWorkerComplaints,
  acceptComplaint,
  completeComplaint,
  sendNotice,
  adminAcceptWorkerComplaint,
  adminCompleteWorkerComplaint,
  resolveComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const router = express.Router();

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

router.post("/", protect, upload.single("media"), createComplaint);

router.get("/my", protect, getMyComplaints);
router.get("/worker", protect, getWorkerComplaints);
router.get("/", protect, getAllComplaints);

// Both paths supported to fix notice failed issue
router.put("/:id/send-notice", protect, sendNotice);
router.put("/notice/:id", protect, sendNotice);

router.put("/:id/accept", protect, acceptComplaint);
router.put("/:id/complete", protect, completeComplaint);

router.put("/:id/admin-accept", protect, adminAcceptWorkerComplaint);
router.put("/:id/admin-complete", protect, adminCompleteWorkerComplaint);

router.put("/:id/resolve", protect, resolveComplaint);
router.delete("/:id", protect, deleteComplaint);

module.exports = router;