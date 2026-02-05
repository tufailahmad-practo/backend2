const express = require("express");
const router = express.Router();

const {
  setAvailability,
  getMyAvailability,
  getAvailabilityByProvider,
  getAvailableSlots, // ✅ ADD THIS
} = require("../controllers/availabilityController");

const { protect, providerOnly } = require("../middleware/authMiddleware");

// PROVIDER
router.post("/", protect, providerOnly, setAvailability);
router.get("/my", protect, providerOnly, getMyAvailability);

// USER
router.get("/provider/:providerId", protect, getAvailabilityByProvider);
router.get("/slots/:providerId", protect, getAvailableSlots);

module.exports = router;
