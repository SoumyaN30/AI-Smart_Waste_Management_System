const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

router.get("/me", authMiddleware, getMyProfile);
router.put("/update", authMiddleware, updateMyProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;