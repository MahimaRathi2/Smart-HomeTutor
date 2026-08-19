require("dotenv").config();
const connectDB = require("../config/db");
const ContactMessage = require("../models/ContactMessage");

async function testContactFlow() {
  try {
    console.log("Connecting to DB...");
    await connectDB();

    console.log("1. Simulating contact form submission...");
    const testDoc = await ContactMessage.create({
      firstName: "TestReact",
      lastName: "User",
      email: "test.react@smarthometutor.com",
      subject: "[Home Tuition Requirement] - Uttarakhand",
      message: "Contact Number: 9876543210\nLocation: Dehradun, Uttarakhand\nEnquiry Type: Home Tuition\n\nMessage:\nLooking for a Class 10 Math tutor.",
    });

    console.log(`✅ Created test ContactMessage ID: ${testDoc._id}`);

    console.log("2. Cleaning up test document...");
    await ContactMessage.findByIdAndDelete(testDoc._id);
    console.log("✅ Cleanup complete.");

    process.exit(0);
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  }
}

testContactFlow();
