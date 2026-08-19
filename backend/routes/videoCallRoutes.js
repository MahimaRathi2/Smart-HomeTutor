/**
 * ==========================================
 * VIDEO CALL ROUTES
 * ==========================================
 * Express routes for initiating and authorizing WebRTC video calls.
 */

const express = require("express");
const router = express.Router();
const videoCallController = require("../controllers/videoCallController");
const { requireAuth } = require("../middleware/authMiddleware");

// Render WebRTC Video Call interface for an accepted booking
// Endpoint: GET /video-call/:bookingId
router.get("/:bookingId", requireAuth, videoCallController.renderVideoCall);

// JSON Status Endpoint: GET /api/video-call/status/:bookingId
router.get("/api/status/:bookingId", requireAuth, videoCallController.getVideoCallStatus);
router.get("/details/:bookingId", requireAuth, videoCallController.getVideoCallDetails);

module.exports = router;
