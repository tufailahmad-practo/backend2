const Availability = require("../models/Availability");
const Booking = require("../models/Booking");


/**
 * PROVIDER → Create or update availability for a day
 * (One availability per provider per dayOfWeek)
 */
const setAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

    if (
      dayOfWeek === undefined ||
      !startTime ||
      !endTime ||
      !slotDuration
    ) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // upsert → update if exists, else create
    const availability = await Availability.findOneAndUpdate(
      {
        providerId: req.user.id,
        dayOfWeek,
      },
      {
        providerId: req.user.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).json(availability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PROVIDER → Get my weekly availability
 */
const getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({
      providerId: req.user.id,
    }).sort({ dayOfWeek: 1 });

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * USER → Get availability of a provider (weekly pattern)
 */
const getAvailabilityByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;

    const availability = await Availability.find({ providerId }).sort({
      dayOfWeek: 1,
    });

    if (!availability.length) {
      return res.status(404).json({ message: "No availability found" });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};











const getAvailableSlots = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0–6

    // 1. Get provider availability for that day
    const availability = await Availability.findOne({
      providerId,
      dayOfWeek,
    });

    if (!availability) {
      return res.json([]);
    }

    const { startTime, endTime, slotDuration } = availability;

    // Helper to convert HH:mm → minutes
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const slots = [];
    let current = toMinutes(startTime);
    const end = toMinutes(endTime);

    // 2. Generate slots
    while (current + slotDuration <= end) {
      const slotStart = current;
      const slotEnd = current + slotDuration;

      slots.push({
        startTime: `${String(Math.floor(slotStart / 60)).padStart(2, "0")}:${String(slotStart % 60).padStart(2, "0")}`,
        endTime: `${String(Math.floor(slotEnd / 60)).padStart(2, "0")}:${String(slotEnd % 60).padStart(2, "0")}`,
      });

      current = slotEnd;
    }

    // 3. Get already booked slots
    const bookings = await Booking.find({
      providerId,
      date,
      status: { $in: ["pending", "confirmed"] },
    });

    // 4. Remove booked slots
    const availableSlots = slots.filter((slot) => {
      return !bookings.some(
        (b) =>
          b.startTime === slot.startTime &&
          b.endTime === slot.endTime
      );
    });

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAvailability = async (req, res) => {
  await Availability.findByIdAndDelete(req.params.id);
  res.json({ message: "Availability removed" });
};




module.exports = {
  setAvailability,
  getMyAvailability,
  getAvailabilityByProvider,
  getAvailableSlots,
  deleteAvailability,
};