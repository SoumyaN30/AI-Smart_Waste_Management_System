const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["High", "Medium"],
      default: "Medium",
    },

    area: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
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

    status: {
      type: String,
      enum: ["pending", "accepted", "completed"],
      default: "pending",
    },

    aiReason: {
      type: String,
      default: "",
    },

    assignedDepartment: {
      type: String,
      enum: ["Garbage Collection", "Sanitation", "General"],
      default: "General",
    },

    aiWasteType: {
      type: String,
      enum: ["", "Dry Waste", "Wet Waste", "Hazardous Waste"],
      default: "",
    },

    aiImagePrediction: {
      type: String,
      default: "",
    },

    aiConfidence: {
      type: Number,
      default: 0,
    },

    noticeSent: {
      type: Boolean,
      default: false,
    },

    noticeAccepted: {
      type: Boolean,
      default: false,
    },

    problemResolved: {
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

requestSchema.index(
  { "location.coordinates": "2dsphere" },
  {
    partialFilterExpression: {
      "location.coordinates": { $exists: true },
    },
  }
);

module.exports = mongoose.model("Request", requestSchema);