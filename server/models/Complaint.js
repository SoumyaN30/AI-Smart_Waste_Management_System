const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    raisedBy: {
      type: String,
      enum: ["citizen", "worker"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Household Garbage Pickup",
        "Clean Roadside Fallen Leaves",
        "Public Washroom Cleaning",
        "Choked Drain",
        "Area Garbage Pickup",
        "Gutter Overflow",
        "Other",
      ],
      default: "Other",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    media: {
      type: String,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
      address: {
        type: String,
        default: "",
      },
      placeName: {
        type: String,
        default: "",
      },
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending",
    },

    noticeSent: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

complaintSchema.index(
  { "location.coordinates": "2dsphere" },
  {
    partialFilterExpression: {
      "location.coordinates": { $exists: true },
    },
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);