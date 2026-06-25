const Request = require("../models/Request");
const User = require("../models/User");
const { predictPriority } = require("../utils/aiPredictor");

const garbageCategories = [
  "Household Garbage Pickup",
  "Area Garbage Pickup",
  "Clean Roadside Fallen Leaves",
  "Other",
];

const sanitationCategories = [
  "Public Washroom Cleaning",
  "Choked Drain",
  "Gutter Overflow",
  "Other",
];

const emergencyCategories = [
  "Gutter Overflow",
  "Choked Drain",
];
const getAllowedCategoriesForWorker = (worker) => {
  const department = String(worker.department || "").trim().toLowerCase();

  if (department === "garbage" || department === "garbage collection") {
    return garbageCategories;
  }

  if (department === "sanitation") {
    return sanitationCategories;
  }

  return [];
};

// CITIZEN: Create new request
const createRequest = async (req, res) => {
  try {
    const {
      category,
      area,
      description,
      latitude,
      longitude,
      address,
      placeName,
      aiWasteType,
      aiImagePrediction,
      aiConfidence,
    } = req.body;

    if (!category || !area) {
      return res.status(400).json({
        msg: "Category and area are required",
      });
    }

    if (category === "Household Garbage Pickup") {
      if (!aiWasteType) {
        return res.status(400).json({
          msg: "Please capture image and predict waste type before submitting",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          msg: "Captured waste image is required",
        });
      }
    }

    if (category !== "Household Garbage Pickup" && !req.file) {
      return res.status(400).json({
        msg: "Photo/video required for this request",
      });
    }

    const aiPrediction = predictPriority(category, description || "");

    const priority = emergencyCategories.includes(category) ? "High" : "Medium";

    const aiReason =
      priority === "High"
        ? "This is an emergency sanitation issue and needs quick action."
        : "This is a normal request and is assigned medium priority.";

    const requestObj = {
      citizen: req.user.id,
      category,
      area,
      description: description || "",
      media: req.file ? req.file.filename : "",
      status: "pending",

      priority: priority,
      aiReason: aiReason,
      assignedDepartment: aiPrediction.assignedDepartment,

      aiWasteType: aiWasteType || "",
      aiImagePrediction: aiImagePrediction || aiWasteType || "",
      aiConfidence: Number(aiConfidence) || 0,

      noticeSent: false,
      noticeAccepted: false,
      problemResolved: false,
    };

    if (latitude && longitude) {
      requestObj.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || area,
        placeName: placeName || "",
      };
    }

    const request = await Request.create(requestObj);

    res.status(201).json({
      msg: "Request submitted successfully",
      request,
    });
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// CITIZEN: Get own requests
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ citizen: req.user.id })
      .populate("acceptedBy", "name fullName department")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Get My Requests Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN: Get all requests
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("citizen", "name fullName email phone address landmark")
      .populate("acceptedBy", "name fullName department")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Get All Requests Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER: Get requests based on department
const getWorkerRequests = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can view requests",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const requests = await Request.find({
      category: { $in: allowedCategories },
      $or: [
        { status: "pending" },
        { acceptedBy: worker._id },
        { noticeSent: true },
      ],
    })
      .populate("citizen", "name fullName email phone address landmark")
      .populate("acceptedBy", "name fullName department")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Get Worker Requests Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER: Accept request
const acceptRequest = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can accept requests",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        msg: "Request not found",
      });
    }

    if (!allowedCategories.includes(request.category)) {
      return res.status(403).json({
        msg: "You are not allowed to accept this department request",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        msg: "Request already accepted or completed",
      });
    }

    request.status = "accepted";
    request.acceptedBy = req.user.id;

    await request.save();

    res.json({
      msg: "Request accepted successfully",
      request,
    });
  } catch (err) {
    console.error("Accept Request Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER: Mark request as completed
const completeRequest = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can complete requests",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        msg: "Request not found",
      });
    }

    if (!allowedCategories.includes(request.category)) {
      return res.status(403).json({
        msg: "You are not allowed to complete this department request",
      });
    }

    if (!request.acceptedBy) {
      return res.status(400).json({
        msg: "Request not accepted yet",
      });
    }

    if (String(request.acceptedBy) !== String(req.user.id)) {
      return res.status(403).json({
        msg: "You can complete only your accepted request",
      });
    }

    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    res.json({
      msg: "Request completed successfully",
      request,
    });
  } catch (err) {
    console.error("Complete Request Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN: Send notice
const sendNotice = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        msg: "Request not found",
      });
    }

    if (request.status === "completed") {
      return res.status(400).json({
        msg: "Notice cannot be sent because this request is already completed",
      });
    }

    if (request.noticeSent) {
      return res.status(400).json({
        msg: "Notice already sent for this request",
      });
    }

    request.noticeSent = true;
    request.noticeAccepted = false;
    request.problemResolved = false;

    await request.save();

    res.json({
      msg: "Notice sent successfully",
      request,
    });
  } catch (err) {
    console.error("Send Notice Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER: Accept notice
const acceptNotice = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can accept notices",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        msg: "Request not found",
      });
    }

    if (!allowedCategories.includes(request.category)) {
      return res.status(403).json({
        msg: "You are not allowed to accept this department notice",
      });
    }

    if (!request.noticeSent) {
      return res.status(400).json({
        msg: "Notice was not sent by admin",
      });
    }

    if (request.noticeAccepted) {
      return res.status(400).json({
        msg: "Notice already accepted",
      });
    }

    request.noticeAccepted = true;
    request.acceptedBy = req.user.id;
    request.status = "accepted";

    await request.save();

    res.json({
      msg: "Notice accepted successfully",
      request,
    });
  } catch (err) {
    console.error("Accept Notice Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER: Resolve notice problem
const resolveProblem = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can resolve notices",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        msg: "Request not found",
      });
    }

    if (!allowedCategories.includes(request.category)) {
      return res.status(403).json({
        msg: "You are not allowed to resolve this department notice",
      });
    }

    if (!request.noticeSent) {
      return res.status(400).json({
        msg: "No notice was sent for this request",
      });
    }

    if (!request.noticeAccepted) {
      return res.status(400).json({
        msg: "Accept notice before resolving",
      });
    }

    if (String(request.acceptedBy) !== String(req.user.id)) {
      return res.status(403).json({
        msg: "You can resolve only your accepted notice",
      });
    }

    request.problemResolved = true;
    request.status = "completed";
    request.completedAt = new Date();

    await request.save();

    res.json({
      msg: "Problem resolved successfully",
      request,
    });
  } catch (err) {
    console.error("Resolve Problem Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  getWorkerRequests,
  acceptRequest,
  completeRequest,
  sendNotice,
  acceptNotice,
  resolveProblem,
};