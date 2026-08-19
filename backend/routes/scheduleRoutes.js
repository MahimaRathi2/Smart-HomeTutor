/**
 * ==========================================
 * SCHEDULE ROUTES
 * ==========================================
 * Endpoints for class scheduling and attendance logging.
 */

const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { requireAuth } = require("../middleware/authMiddleware");

router.post("/create", requireAuth, scheduleController.createClassSchedule);
router.get("/list", requireAuth, scheduleController.getSchedules);
router.put("/:id/reschedule", requireAuth, scheduleController.rescheduleClass);
router.patch("/:id/attendance", requireAuth, scheduleController.markAttendance);

module.exports = router;
