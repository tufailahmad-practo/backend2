const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 0 = Sunday, 6 = Saturday
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },

    // "09:00"
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    // "17:00"
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    // minutes (e.g. 15, 30, 60)
    slotDuration: {
      type: Number,
      required: true,
      min: 5,
    },
  },
  { timestamps: true }
);

/**
 * Prevent duplicate availability
 * Example: provider cannot create two Monday schedules
 */
availabilitySchema.index(
  { providerId: 1, dayOfWeek: 1 },
  { unique: true }
);

module.exports = mongoose.model("Availability", availabilitySchema);
