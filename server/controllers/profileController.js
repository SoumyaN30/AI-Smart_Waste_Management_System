const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getUserId = (req) => {
  return req.user?.id || req.user?._id || req.user;
};

exports.getMyProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ msg: "Failed to fetch profile" });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    const { name, phone, address, landmark, latitude, longitude } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        msg: "Full name, phone number and address are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        msg: "Phone number must be exactly 10 digits",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        address,
        landmark,
        latitude,
        longitude,
      },
      { new: true }
    ).select("-password");

    res.status(200).json({
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ msg: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = getUserId(req);

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        msg: "Old password, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        msg: "New password and confirm password do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        msg: "Password must contain letters, numbers and symbols",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      msg: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ msg: "Failed to change password" });
  }
};