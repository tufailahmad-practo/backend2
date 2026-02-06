const Service = require("../models/service");

const createService = async (req, res) => {
  try {
    const { name, duration, price } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const service = await Service.create({
      providerId: req.user.id,
      name,
      duration,
      price,
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// GET services of a provider
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.user.id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET all active services (for users)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate(
      "providerId",
      "name"
    );
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createService,
  getMyServices,
  getAllServices,
};
