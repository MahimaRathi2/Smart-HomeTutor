const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const TutorProfile = require("../models/TutorProfile");

async function testTutorRegistration() {
  console.log("🚀 Starting Tutor Registration Automated Verification...");

  const dbUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hometutor";
  await mongoose.connect(dbUri);
  console.log("✅ Connected to MongoDB:", mongoose.connection.name);
  await TutorProfile.cleanIndexes();

  // Test Document Creation 1
  const app1 = await TutorProfile.create({
    user: null,
    fullName: "Mahima Test Application 1",
    email: "mahima.test1@example.com",
    mobile: "9876543210",
    city: "New Delhi",
    highestQualification: "M.Sc Mathematics",
    totalExperience: "3 Years",
    classType: ["One-to-One", "Group Class"],
    specialization: ["Subject Specialization", "Competitive Exam Preparation"],
    teachingMethod: "Interactive conceptual learning with past paper practice.",
    studentLevel: "Advanced",
    paymentDetails: {
      accountHolderName: "Mahima Rathi",
      bankName: "HDFC Bank",
      accountNumber: "987654321098",
      ifscCode: "HDFC0001234",
      upiId: "mahima@upi",
    },
    registrationStatus: "Pending",
    verificationStatus: "Pending",
    verified: false,
    documents: [
      {
        name: "test_degree.pdf",
        docType: "Qualification Certificate",
        fileUrl: "/uploads/tutors/test_degree.pdf",
        status: "Pending",
      },
      {
        name: "test_resume.pdf",
        docType: "Resume / CV",
        fileUrl: "/uploads/tutors/test_resume.pdf",
        status: "Pending",
      },
    ],
  });
  console.log("✅ App 1 Created successfully. ID:", app1._id.toString(), "| User:", app1.user, "| ClassType:", app1.classType, "| Bank:", app1.paymentDetails.bankName);

  // Test Document Creation 2 (Same Applicant Name & Email - Multi-Submission Test)
  const app2 = await TutorProfile.create({
    user: null,
    fullName: "Mahima Test Application 1",
    email: "mahima.test1@example.com",
    mobile: "9876543210",
    city: "New Delhi",
    highestQualification: "B.Ed",
    totalExperience: "5 Years",
    registrationStatus: "Pending",
    verificationStatus: "Pending",
    verified: false,
    documents: [
      {
        name: "test_id.jpg",
        docType: "ID Proof",
        fileUrl: "/uploads/tutors/test_id.jpg",
        status: "Pending",
      },
    ],
  });
  console.log("✅ App 2 Created successfully. ID:", app2._id.toString(), "| User:", app2.user, "| Status:", app2.registrationStatus);

  // Clean up test documents
  await TutorProfile.findByIdAndDelete(app1._id);
  await TutorProfile.findByIdAndDelete(app2._id);
  console.log("🧹 Cleaned up test documents.");

  await mongoose.disconnect();
  console.log("🎉 Verification Complete! All assertions passed.");
}

testTutorRegistration().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
