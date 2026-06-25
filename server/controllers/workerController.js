const User = require("../models/User");
const Request = require("../models/Request");

exports.getFreeWorkers = async (req, res) => {
  const workers = await User.find({
    role: "worker",
    availability: "free"
  });

  res.json(workers);
};

exports.updateAvailability = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user.id,
    { availability: req.body.status }
  );

  res.json({ msg: "Updated" });
};

exports.myTasks = async (req, res) => {
  const data = await Request.find({
    assignedWorker: req.user.id
  }).populate("citizen", "name");

  res.json(data);
};