const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { createAdminNotification } = require("../utils/notificationHelper");

console.log("=== VERIFYING NOTIFICATION HELPER & MODEL COMPATIBILITY ===");

async function testUnit() {
  try {
    const doc = new Notification({
      user: new mongoose.Types.ObjectId(),
      role: "admin",
      sourceUser: new mongoose.Types.ObjectId(),
      sourceRole: "student",
      title: "New Tutor Request",
      message: "Mahima Rathi has submitted a tutor request for Mathematics.",
      type: "tutor_request",
      actionUrl: "/dashboard/admin?tab=tutor-verifications",
      isRead: false,
      read: false,
    });

    const err = doc.validateSync();
    if (err) {
      console.error("❌ Validation Failed:", err.message);
      process.exit(1);
    }

    console.log("✅ Admin Notification Schema Validation Passed!");
    console.log("Verified fields:", {
      title: doc.title,
      message: doc.message,
      sourceRole: doc.sourceRole,
      type: doc.type,
      actionUrl: doc.actionUrl,
      isRead: doc.isRead,
    });
  } catch (e) {
    console.error("Error:", e);
  }
}

testUnit();
