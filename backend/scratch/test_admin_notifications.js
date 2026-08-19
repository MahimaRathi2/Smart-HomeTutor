const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { createAdminNotification } = require("../utils/notificationHelper");

console.log("=== ADMIN NOTIFICATION TEST ===");

async function testHelper() {
  try {
    const notif = new Notification({
      user: new mongoose.Types.ObjectId(),
      role: "admin",
      sourceUser: new mongoose.Types.ObjectId(),
      sourceRole: "student",
      title: "New Tutor Request",
      message: "Mahima Rathi (Student) has submitted a new tutor request for Mathematics.",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=tutor-verifications",
      isRead: false,
      read: false,
    });

    const validationErr = notif.validateSync();
    if (validationErr) {
      console.error("❌ Validation error:", validationErr.message);
      process.exit(1);
    }
    console.log("✅ Admin Notification Schema Validation Passed!");
    console.log("Sample notification document:", {
      title: notif.title,
      message: notif.message,
      sourceRole: notif.sourceRole,
      type: notif.type,
      actionUrl: notif.actionUrl,
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

testHelper();
