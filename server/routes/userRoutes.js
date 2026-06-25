const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile
router.get("/profile", protect, getMyProfile);

// Update logged-in user's profile
router.put("/profile", protect, updateMyProfile);

// Change logged-in user's password
router.put("/change-password", protect, changePassword);

module.exports = router;