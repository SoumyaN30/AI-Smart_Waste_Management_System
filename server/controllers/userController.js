const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        msg: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      msg: "Failed to fetch profile",
    });
  }
};

// UPDATE logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    const { fullName, name, phone, address, landmark, mapLocation } = req.body;

    const finalName = fullName || name;

    if (!finalName || !phone || !address) {
      return res.status(400).json({
        message: "Full name, phone and address are required",
        msg: "Full name, phone and address are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
        msg: "Phone number must be exactly 10 digits",
      });
    }

    const updateData = {
      name: finalName,
      fullName: finalName,
      phone,
      address,
      landmark,
      mapLocation,
    };

    if (mapLocation?.lat !== undefined) {
      updateData.latitude = mapLocation.lat;
    }

    if (mapLocation?.lng !== undefined) {
      updateData.longitude = mapLocation.lng;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        msg: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      msg: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      msg: "Failed to update profile",
    });
  }
};

// CHANGE PASSWORD
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Old password, new password and confirm password are required",
        msg: "Old password, new password and confirm password are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
        msg: "New password and confirm password do not match",
      });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain letters, numbers and symbols",
        msg: "Password must contain letters, numbers and symbols",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        msg: "User not found",
      });
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!isOldPasswordCorrect) {
      return res.status(400).json({
        message: "Old password is incorrect",
        msg: "Old password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
      msg: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      message: "Failed to change password",
      msg: "Failed to change password",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};