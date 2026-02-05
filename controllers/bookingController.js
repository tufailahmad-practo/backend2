const Booking = require("../models/Booking");
const Service = require("../models/service");
const Availability = require("../models/Availability");

/**
 * USER → Create booking request
 * Status: pending
 */
const createBooking = async (req, res) => {
  try {
    const { serviceId, providerId, date, startTime, endTime } = req.body;

    // 1️⃣ Validate input
    if (!serviceId || !providerId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 2️⃣ Prevent self-booking
    if (providerId.toString() === req.user.id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot book your own service" });
    }

    // 3️⃣ Check service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 4️⃣ Prevent past date & time booking
    const bookingDateTime = new Date(`${date}T${startTime}`);
    if (bookingDateTime < new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot book a past time" });
    }

    // 5️⃣ Get dayOfWeek from date
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday

    // 6️⃣ Check provider availability
    const availability = await Availability.findOne({
      providerId,
      dayOfWeek,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime },
    });

    if (!availability) {
      return res
        .status(400)
        .json({ message: "Provider not available for this time" });
    }

    // 7️⃣ Prevent overlapping bookings
    const existingBooking = await Booking.findOne({
      providerId,
      date,
      status: { $in: ["pending", "confirmed"] },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Time slot already booked" });
    }

    // 8️⃣ Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      providerId,
      serviceId,
      date,
      startTime,
      endTime,
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * USER → Get my bookings
 */
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("serviceId", "name")
      .populate("providerId", "name");

    res.json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PROVIDER → Get bookings for me (Provider Dashboard)
 */
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.user.id })
      .populate("serviceId", "name")
      .populate("userId", "name email");

    res.json(bookings);
  } catch (error) {
    console.error("Get provider bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PROVIDER → Update booking status (confirmed / rejected)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure provider owns this booking
    if (booking.providerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error("Update booking status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
};
