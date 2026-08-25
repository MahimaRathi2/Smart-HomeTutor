/**
 * ==========================================
 * NOTIFICATION CONTROLLER
 * ==========================================
 * APIs for notification fetching, unread counts, status updates, and deletions.
 */

const Notification = require("../models/Notification");
const User = require("../models/User");

const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMe5a3k9bY4xV9E8yKx-N5wF8J2_9cWqP3_kR3n2M5m7p9q1w3e5r";

/**
 * Get all notifications for the authenticated user
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      type: { $ne: "announcement" },
      title: { $not: /^📢/ },
    }).sort({ createdAt: -1 });

    const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching notifications." });
  }
};

/**
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      type: { $ne: "announcement" },
      title: { $not: /^📢/ },
      $or: [{ isRead: false }, { read: false }],
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
      count,
    });
  } catch (err) {
    console.error("Get Unread Count Error:", err);
    return res.status(500).json({ success: false, message: "Server error getting unread count." });
  }
};

/**
 * Mark a single notification as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({ _id: id, user: req.user.id });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (err) {
    console.error("Mark Notification Read Error:", err);
    return res.status(500).json({ success: false, message: "Server error marking notification read." });
  }
};

/**
 * Mark all notifications as read for logged-in user
 */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id }, { isRead: true, read: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (err) {
    console.error("Mark All Notifications Read Error:", err);
    return res.status(500).json({ success: false, message: "Server error marking all notifications read." });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found or unauthorized." });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting notification." });
  }
};

/**
 * Get VAPID public key for Web Push
 */
exports.getVapidPublicKey = async (req, res) => {
  return res.status(200).json({
    success: true,
    vapidPublicKey: VAPID_PUBLIC_KEY,
  });
};

/**
 * Save Web Push subscription
 */
exports.savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ success: false, message: "Invalid push subscription object." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (!user.pushSubscriptions) user.pushSubscriptions = [];

    const exists = user.pushSubscriptions.some((s) => s.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Push subscription saved successfully.",
    });
  } catch (err) {
    console.error("Save Push Subscription Error:", err);
    return res.status(500).json({ success: false, message: "Server error saving push subscription." });
  }
};

/**
 * Run 30-day fee reminder scheduler manually or for testing with mock dates
 */
exports.runFeeScheduler = async (req, res) => {
  try {
    const { mockDaysAhead, mockDate } = req.body || {};
    let testNow = null;

    if (mockDate) {
      testNow = new Date(mockDate);
    } else if (mockDaysAhead) {
      testNow = new Date(Date.now() + Number(mockDaysAhead) * 24 * 60 * 60 * 1000);
    }

    const { checkAndSendFeeReminders } = require("../utils/feeReminderScheduler");
    const result = await checkAndSendFeeReminders(req.app, testNow);

    return res.status(200).json({
      success: true,
      message: "Fee reminder scheduler executed successfully.",
      result,
    });
  } catch (err) {
    console.error("Run Fee Scheduler Error:", err);
    return res.status(500).json({ success: false, message: "Error running fee scheduler." });
  }
};
