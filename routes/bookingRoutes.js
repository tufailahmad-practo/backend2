const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

const { protect, providerOnly } = require("../middleware/authMiddleware");

// USER
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

// PROVIDER
router.get("/provider", protect, providerOnly, getProviderBookings);
router.patch("/:id/status", protect, providerOnly, updateBookingStatus);

module.exports = router;
