const Complaint = require("../models/Complaint");
const User = require("../models/User");

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

// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const { category, message, description } = req.body;

    const finalMessage = message || description;

    if (!finalMessage || !finalMessage.trim()) {
      return res.status(400).json({
        msg: "Complaint message is required",
      });
    }

    const complaint = await Complaint.create({
      user: req.user.id,
      raisedBy: req.user.role,
      category: category || "Other",
      message: finalMessage,
      media: req.file ? req.file.filename : "",
      status: "pending",
      noticeSent: false,
    });

    res.status(201).json({
      msg: "Complaint submitted successfully",
      complaint,
    });
  } catch (err) {
    console.error("Create Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// USER VIEW OWN COMPLAINTS
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .populate("acceptedBy", "name fullName role department")
      .populate("completedBy", "name fullName role department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get My Complaints Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN VIEW ALL COMPLAINTS
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name fullName email phone address landmark role")
      .populate("acceptedBy", "name fullName role department")
      .populate("completedBy", "name fullName role department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get All Complaints Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER VIEW COMPLAINTS BASED ON DEPARTMENT CATEGORY
const getWorkerComplaints = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can view complaints",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    if (allowedCategories.length === 0) {
      return res.status(400).json({
        msg: "Worker department is invalid or not assigned",
      });
    }

    const complaints = await Complaint.find({
      raisedBy: "citizen",
      category: { $in: allowedCategories },
      $or: [{ noticeSent: true }, { acceptedBy: worker._id }],
    })
      .populate("user", "name fullName email phone address landmark role")
      .populate("acceptedBy", "name fullName role department")
      .populate("completedBy", "name fullName role department")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (err) {
    console.error("Get Worker Complaints Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER ACCEPT CITIZEN COMPLAINT
const acceptComplaint = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can accept complaints",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    if (!allowedCategories.includes(complaint.category)) {
      return res.status(403).json({
        msg: "You are not allowed to accept this department complaint",
      });
    }

    if (complaint.raisedBy !== "citizen") {
      return res.status(403).json({
        msg: "Workers can accept only citizen complaints",
      });
    }

    if (!complaint.noticeSent) {
      return res.status(400).json({
        msg: "Admin notice is required before accepting citizen complaint",
      });
    }

    if (complaint.status !== "pending") {
      return res.status(400).json({
        msg: "Complaint already accepted or completed",
      });
    }

    complaint.status = "accepted";
    complaint.acceptedBy = req.user.id;

    await complaint.save();

    res.json({
      msg: "Complaint accepted by worker",
      complaint,
    });
  } catch (err) {
    console.error("Accept Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// WORKER COMPLETE CITIZEN COMPLAINT
const completeComplaint = async (req, res) => {
  try {
    const worker = await User.findById(req.user.id);

    if (!worker || worker.role !== "worker") {
      return res.status(403).json({
        msg: "Only workers can complete complaints",
      });
    }

    const allowedCategories = getAllowedCategoriesForWorker(worker);

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    if (!allowedCategories.includes(complaint.category)) {
      return res.status(403).json({
        msg: "You are not allowed to complete this department complaint",
      });
    }

    if (complaint.raisedBy !== "citizen") {
      return res.status(403).json({
        msg: "Workers can complete only citizen complaints",
      });
    }

    if (String(complaint.acceptedBy) !== String(req.user.id)) {
      return res.status(403).json({
        msg: "You can complete only your accepted complaint",
      });
    }

    complaint.status = "completed";
    complaint.completedBy = req.user.id;
    complaint.completedAt = new Date();

    await complaint.save();

    res.json({
      msg: "Citizen complaint completed by worker",
      complaint,
    });
  } catch (err) {
    console.error("Complete Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN SEND NOTICE FOR CITIZEN COMPLAINT
const sendNotice = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    if (complaint.raisedBy === "worker") {
      return res.status(400).json({
        msg: "Notice cannot be sent for worker complaints. Admin must handle directly.",
      });
    }

    if (!complaint.category) {
      complaint.category = "Other";
    }

    complaint.noticeSent = true;

    await complaint.save();

    res.json({
      msg: "Notice sent to respective worker dashboard",
      complaint,
    });
  } catch (err) {
    console.error("Send Complaint Notice Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN ACCEPT WORKER COMPLAINT
const adminAcceptWorkerComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    if (complaint.raisedBy !== "worker") {
      return res.status(400).json({
        msg: "Admin can directly accept only worker complaints",
      });
    }

    complaint.status = "accepted";
    complaint.acceptedBy = req.user.id;

    await complaint.save();

    res.json({
      msg: "Worker complaint accepted by admin",
      complaint,
    });
  } catch (err) {
    console.error("Admin Accept Worker Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

// ADMIN COMPLETE WORKER COMPLAINT
const adminCompleteWorkerComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    if (complaint.raisedBy !== "worker") {
      return res.status(400).json({
        msg: "Admin can directly complete only worker complaints",
      });
    }

    complaint.status = "completed";
    complaint.completedBy = req.user.id;
    complaint.completedAt = new Date();

    await complaint.save();

    res.json({
      msg: "Worker complaint completed by admin",
      complaint,
    });
  } catch (err) {
    console.error("Admin Complete Worker Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    complaint.status = "completed";
    complaint.completedBy = req.user.id;
    complaint.completedAt = new Date();

    await complaint.save();

    res.json({
      msg: "Complaint resolved successfully",
      complaint,
    });
  } catch (err) {
    console.error("Resolve Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        msg: "Complaint not found",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      msg: "Complaint deleted successfully",
    });
  } catch (err) {
    console.error("Delete Complaint Error:", err);
    res.status(500).json({
      msg: err.message,
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getWorkerComplaints,
  acceptComplaint,
  completeComplaint,
  sendNotice,
  adminAcceptWorkerComplaint,
  adminCompleteWorkerComplaint,
  resolveComplaint,
  deleteComplaint,
};