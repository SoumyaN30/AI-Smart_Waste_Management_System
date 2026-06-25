const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"],
    },

    address: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    mapLocation: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["citizen", "worker", "admin"],
      default: "citizen",
    },

    department: {
      type: String,
      default: "",
    },

    availability: {
      type: String,
      default: "Free",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);