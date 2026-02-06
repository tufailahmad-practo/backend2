const express = require("express");
const router = express.Router();

const {
  createService,
  getMyServices,
  getAllServices,
} = require("../controllers/serviceController");

const { protect, providerOnly } = require("../middleware/authMiddleware");

// PROVIDER
router.post("/", protect, providerOnly, createService);
router.get("/my", protect, providerOnly, getMyServices);

// USER
router.get("/", getAllServices);

module.exports = router;
