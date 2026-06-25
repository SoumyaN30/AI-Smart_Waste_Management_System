const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      phone,
      address,
      landmark,
      mapLocation,
      latitude,
      longitude,
      password,
      confirmPassword,
      role,
      department,
    } = req.body;

    const finalName = fullName || name;

    if (!finalName || !email || !phone || !address || !password) {
      return res.status(400).json({
        msg: "Full name, email, phone, address and password are required",
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({
        msg: "Phone number must be exactly 10 digits",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        msg: "Password and confirm password do not match",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: finalName,
      fullName: finalName,
      email,
      phone,
      address,
      landmark,
      password: hashedPassword,
      role: role || "citizen",
      department,
      mapLocation: mapLocation || {
        lat: latitude || null,
        lng: longitude || null,
      },
      latitude: latitude || mapLocation?.lat || null,
      longitude: longitude || mapLocation?.lng || null,
    });

    const token = generateToken(user);

    res.status(201).json({
      msg: "Registration successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name || user.fullName,
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        landmark: user.landmark,
        role: user.role,
        department: user.department,
        mapLocation: user.mapLocation,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      msg: "Server error during registration",
    });
  }
};

// LOGIN USER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      msg: "Login successful",
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name || user.fullName,
        fullName: user.fullName || user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        landmark: user.landmark,
        role: user.role,
        department: user.department,
        mapLocation: user.mapLocation,
        latitude: user.latitude,
        longitude: user.longitude,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      msg: "Server error during login",
    });
  }
};

module.exports = {
  register,
  login,
};