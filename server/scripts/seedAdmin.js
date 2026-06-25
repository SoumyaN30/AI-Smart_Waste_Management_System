require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const adminEmail = "admin@gmail.com";
    const adminPassword = "admin@123";

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.name = "Admin";
      existingAdmin.fullName = "Admin";
      existingAdmin.phone = "9999999999";
      existingAdmin.address = "Admin Office";
      existingAdmin.landmark = "Main Office";
      existingAdmin.role = "admin";
      existingAdmin.department = "";
      existingAdmin.password = hashedPassword;

      await existingAdmin.save();

      console.log("Admin account already existed, password updated.");
    } else {
      await User.create({
        name: "Admin",
        fullName: "Admin",
        email: adminEmail,
        phone: "9999999999",
        address: "Admin Office",
        landmark: "Main Office",
        role: "admin",
        department: "",
        password: hashedPassword,
      });

      console.log("Admin account created successfully.");
    }

    console.log("Email: admin@gmail.com");
    console.log("Password: admin@123");

    process.exit(0);
  } catch (error) {
    console.error("Seed admin error:", error);
    process.exit(1);
  }
};

seedAdmin();