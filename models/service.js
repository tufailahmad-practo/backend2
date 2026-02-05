const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // minutes
      required: true,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true }
);

// 👇 THIS IS THE IMPORTANT PART
module.exports =
  mongoose.models.Service || mongoose.model("Service", serviceSchema);
