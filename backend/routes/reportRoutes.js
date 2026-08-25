/**
 * ==========================================
 * REPORT ROUTES
 * ==========================================
 * Express router for 30-day automated progress reports,
 * test mode manual triggers, history, and PDF downloads.
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { requireAuth } = require("../middleware/authMiddleware");

// Manual trigger check for dev / test mode (accepts mockDaysAhead)
router.post("/trigger-check", requireAuth, reportController.triggerReportCheck);

// Get user's progress report history
router.get("/history", requireAuth, reportController.getReportHistory);

// Download specific report PDF
router.get("/download/:reportId", requireAuth, reportController.downloadReport);

module.exports = router;
