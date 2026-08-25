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

module.exports = router;
