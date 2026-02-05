const express = require("express");
const router = express.Router();

const { getProviderDashboard } = require("../controllers/providerController");
const { protect, providerOnly } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, providerOnly, getProviderDashboard);

module.exports = router;
