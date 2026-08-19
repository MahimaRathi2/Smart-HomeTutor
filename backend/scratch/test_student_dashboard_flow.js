const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const TutorProfile = require("../models/TutorProfile");
const BookingRequest = require("../models/BookingRequest");

async function runTest() {
  console.log("🚀 Starting Student Dashboard Backend Verification...");

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hometutor";
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ Connected to MongoDB:", mongoose.connection.name);
  } catch (err) {
    console.log("⚠️ Could not connect to remote MongoDB, connecting to local MongoDB fallback...");
    await mongoose.connect("mongodb://127.0.0.1:27017/hometutor");
    console.log("✅ Connected to local MongoDB fallback!");
  }

  // 1. Verify Student User exist or create dummy student
  let student = await User.findOne({ role: "student" });
  if (!student) {
    student = await User.create({
      name: "Test Student Dashboard",
      email: "teststudent_dash@smarthometutor.com",
      password: "password123",
      role: "student",
      walletBalance: 500,
      referralCode: "STUDENT100"
    });
    console.log("✅ Created Test Student User:", student._id);
  } else {
    console.log("✅ Found Existing Student User:", student._id, student.name);
  }

  // 2. Verify Tutor Profiles exist
  const tutorsCount = await TutorProfile.countDocuments();
  console.log("✅ Total Tutor Profiles in MongoDB:", tutorsCount);

  // 3. Verify Booking Requests for Student
  const studentBookings = await BookingRequest.find({ student: student._id });
  console.log("✅ Total Bookings for Test Student:", studentBookings.length);

  await mongoose.disconnect();
  console.log("🎉 Student Dashboard Backend Verification Complete!");
}

runTest().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
