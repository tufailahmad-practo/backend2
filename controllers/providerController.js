const Booking = require("../models/Booking");

const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user.id;

    const today = new Date().toISOString().split("T")[0];

    const totalBookings = await Booking.countDocuments({ providerId });

    const pendingBookings = await Booking.countDocuments({
      providerId,
      status: "pending",
    });

    const confirmedBookings = await Booking.countDocuments({
      providerId,
      status: "confirmed",
    });

    const todayBookings = await Booking.countDocuments({
      providerId,
      date: today,
      status: { $in: ["pending", "confirmed"] },
    });

    res.json({
      totalBookings,
      pendingBookings,
      confirmedBookings,
      todayBookings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProviderDashboard };
