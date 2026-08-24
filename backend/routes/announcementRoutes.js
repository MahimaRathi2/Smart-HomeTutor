const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, announcementController.getPublicAnnouncements);

module.exports = router;
