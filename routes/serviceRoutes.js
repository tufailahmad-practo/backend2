const express = require("express");
const router = express.Router();

const {
  createService,
  getMyServices,
} = require("../controllers/serviceController");

const { protect, providerOnly } = require("../middleware/authMiddleware");

router.post("/", protect, providerOnly, createService);
router.get("/my", protect, providerOnly, getMyServices);

module.exports = router;
