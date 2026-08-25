/**
 * ==========================================
 * NOTIFICATION ROUTES
 * ==========================================
 * Endpoints for user notification management (Student, Parent, Tutor).
 */

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/", requireAuth, notificationController.getNotifications);
router.get("/unread-count", requireAuth, notificationController.getUnreadCount);
router.get("/vapid-key", notificationController.getVapidPublicKey);
router.post("/subscribe", requireAuth, notificationController.savePushSubscription);
router.patch("/read-all", requireAuth, notificationController.markAllAsRead);
router.patch("/:id/read", requireAuth, notificationController.markAsRead);
router.delete("/:id", requireAuth, notificationController.deleteNotification);
router.post("/run-fee-scheduler", notificationController.runFeeScheduler);

module.exports = router;
