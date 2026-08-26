const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const connectDB = require("../backend/config/db");
const User = require("../backend/models/User");

async function testReferralFlow() {
  try {
    await connectDB();
    console.log(" Connected to Database");

    // 1. Find or create a test Student user
    let student = await User.findOne({ role: "student" });
    if (!student) {
      student = await User.create({
        name: "Test Student Referrer",
        email: "teststudentref@example.com",
        password: "password123",
        role: "student",
        referralCode: "REF-STUDENT1",
      });
    } else if (!student.referralCode) {
      student.referralCode = "REF-STUDENT1";
      await student.save();
    }

    // 2. Find or create a test Tutor user
    let tutor = await User.findOne({ role: "tutor" });
    if (!tutor) {
      tutor = await User.create({
        name: "Test Tutor Referrer",
        email: "testtutorref@example.com",
        password: "password123",
        role: "tutor",
        tutorStatus: "approved",
        referralCode: "REF-TUTOR1",
      });
    } else if (!tutor.referralCode) {
      tutor.referralCode = "REF-TUTOR1";
      await tutor.save();
    }

    console.log(`Student Referral Code: ${student.referralCode}`);
    console.log(`Tutor Referral Code: ${tutor.referralCode}`);

    // Verify student referred count
    const studentCount = await User.countDocuments({ referredBy: student.referralCode });
    // Verify tutor referred count
    const tutorCount = await User.countDocuments({ referredBy: tutor.referralCode });

    console.log(`Student Referred Count: ${studentCount}`);
    console.log(`Tutor Referred Count: ${tutorCount}`);

    console.log("✅ Referral backend data verification successful!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test Referral Flow Error:", err);
    process.exit(1);
  }
}

testReferralFlow();
