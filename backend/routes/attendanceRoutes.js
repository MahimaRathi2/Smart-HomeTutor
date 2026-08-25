/**
 * ==========================================
 * ATTENDANCE ROUTES
 * ==========================================
 * Express router for attendance marking,
 * dynamic percentage calculation, and subject logs.
 */

const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { requireAuth, authorizeRole } = require("../middleware/authMiddleware");

// Mark or Update attendance (Tutor / Admin)
router.post(
  "/mark",
  requireAuth,
  authorizeRole("tutor", "admin"),
  attendanceController.markOrUpdateAttendance
);

// Get student attendance summary & subject-wise breakdown
router.get(
  "/student",
  requireAuth,
  attendanceController.getStudentAttendanceSummary
);
router.get(
  "/student/:studentId",
  requireAuth,
  attendanceController.getStudentAttendanceSummary
);

// Get tutor classes for attendance marking
router.get(
  "/tutor/classes",
  requireAuth,
  authorizeRole("tutor", "admin"),
  attendanceController.getTutorClassesForAttendance
);

module.exports = router;
