/**
 * ==========================================
 * COMPLAINT ROUTES
 * ==========================================
 * Endpoints for submitting and viewing complaint tickets.
 */

const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/submit", requireAuth, complaintController.submitComplaint);
router.get("/list", requireAuth, complaintController.getComplaints);
router.get("/:id", requireAuth, complaintController.getComplaintById);

// Complaint Conversation Routes
router.get("/:complaintId/messages", requireAuth, complaintController.getComplaintMessages);
router.post("/:complaintId/messages", requireAuth, complaintController.sendComplaintMessage);
router.patch("/:complaintId/messages/read", requireAuth, complaintController.markComplaintMessagesRead);

module.exports = router;
