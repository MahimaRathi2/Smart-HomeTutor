const mongoose = require("mongoose");
const BookingRequest = require("../models/BookingRequest");
const Notification = require("../models/Notification");
const { createAdminNotification } = require("../utils/notificationHelper");

console.log("=== TUTOR REQUEST MODEL & ADMIN NOTIFICATION TEST ===");

async function runTest() {
  try {
    // 1. Verify BookingRequest model instantiation with null tutor
    const testDoc = new BookingRequest({
      student: new mongoose.Types.ObjectId(),
      tutor: null,
      tutorProfile: null,
      message: "Custom Tutor Request Test: Subject: Maths, Grade: 12",
      status: "Pending",
    });

    const err = testDoc.validateSync();
    if (err) {
      console.error("❌ Validation Failed:", err.message);
      process.exit(1);
    }

    console.log("✅ BookingRequest validation passed with tutor: null!");
  } catch (e) {
    console.error("Test Error:", e);
  }
}

runTest();
